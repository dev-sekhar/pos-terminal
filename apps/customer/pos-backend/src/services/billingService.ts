import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export const getBillingHistory = async (tenantId: string) => {
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: { 
      pricingPlan: true,
      payments: true
    },
    orderBy: { createdAt: 'desc' },
  });
  return invoices;
};

export const getCurrentPlanDetails = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { pricingPlan: true, nextPlan: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return {
    currentPlan: tenant.pricingPlan,
    currentPlanStartDate: tenant.currentPlanStartDate,
    currentPlanEndDate: tenant.currentPlanEndDate,
    nextPlan: tenant.nextPlan,
    nextPlanActivationDate: tenant.nextPlanActivationDate,
    stripeCustomerId: tenant.stripeCustomerId,
    stripeSubscriptionId: tenant.stripeSubscriptionId,
  };
};

export const subscribeToPlan = async (tenantId: string, planId: number, paymentMethodId: string) => {
  const pricingPlan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
  if (!pricingPlan) {
    throw new Error('Pricing plan not found.');
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  // Handle free plans or contact us plans
  if (!pricingPlan.price || pricingPlan.price === 0) {
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        pricingPlanId: pricingPlan.id,
        currentPlanStartDate: now,
        currentPlanEndDate: threeMonthsLater,
        active: true
      },
    });

    // Create invoice for free plan and mark as paid
    await prisma.invoice.create({
      data: {
        tenantId,
        planId: pricingPlan.id,
        amount: 0,
        dueDate: threeMonthsLater,
        status: 'PAID',
        description: `Free plan subscription (3 months)`,
        payments: {
          create: {
            amount: 0,
            paymentDate: now,
            method: 'FREE',
            reference: 'FREE_PLAN_AUTO_PAID'
          }
        }
      },
    });

    return { message: `Successfully subscribed to ${pricingPlan.name} plan (3 months free)`, status: 'succeeded' };
  }

  let customerId = tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.name + '@example.com',
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    customerId = customer.id;
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId },
    });
  }

  let stripePriceId: string;
  try {
    const existingProducts = await stripe.products.search({
      query: `metadata['pricingPlanId']:'${pricingPlan.id}'`,
    });

    let stripeProduct;
    if (existingProducts.data.length > 0) {
      stripeProduct = existingProducts.data[0];
    } else {
      stripeProduct = await stripe.products.create({
        name: pricingPlan.name,
        metadata: { pricingPlanId: pricingPlan.id.toString() },
      });
    }

    const priceInCents = Math.round(pricingPlan.price * 100);
    const existingPrices = await stripe.prices.search({
      query: `product:'${stripeProduct.id}' AND unit_amount:${priceInCents}`,
    });

    let stripePrice;
    if (existingPrices.data.length > 0) {
      stripePrice = existingPrices.data[0];
    } else {
      stripePrice = await stripe.prices.create({
        unit_amount: priceInCents,
        currency: pricingPlan.currency.toLowerCase(),
        recurring: { interval: 'month' },
        product: stripeProduct.id,
      });
    }
    stripePriceId = stripePrice.id;

  } catch (error) {
    console.error('Error creating/finding Stripe Product/Price:', error);
    throw new Error('Failed to set up Stripe product/price.');
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: stripePriceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  // Update Tenant with new plan details
  const now = new Date();
  const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      pricingPlanId: pricingPlan.id,
      currentPlanStartDate: now,
      currentPlanEndDate: oneMonthLater, // Assuming 1 month cycle
      stripeSubscriptionId: subscription.id,
    },
  });

  // Create Invoice record
  await prisma.invoice.create({
    data: {
      tenantId,
      planId: pricingPlan.id,
      amount: pricingPlan.price,
      dueDate: oneMonthLater,
      status: paymentIntent.status === 'succeeded' ? 'PAID' : 'PENDING',
      description: `Subscription for ${pricingPlan.name} plan`,
      payments: {
        create: {
          amount: pricingPlan.price,
          paymentDate: new Date(),
          method: 'CARD',
          paymentGatewayTransactionId: paymentIntent.id,
        },
      },
    },
  });

  return { clientSecret: paymentIntent.client_secret, status: paymentIntent.status };
};

export const changePlan = async (tenantId: string, newPlanId: number) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { pricingPlan: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const newPricingPlan = await prisma.pricingPlan.findUnique({ where: { id: newPlanId } });
  if (!newPricingPlan) {
    throw new Error('New pricing plan not found.');
  }

  if (!tenant.stripeSubscriptionId) {
    throw new Error('Tenant does not have an active Stripe subscription.');
  }

  const now = new Date();
  // Check if current cycle has ended
  if (tenant.currentPlanEndDate && now < tenant.currentPlanEndDate) {
    // Current cycle has NOT ended, schedule the change
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        nextPlanId: newPricingPlan.id,
        nextPlanActivationDate: tenant.currentPlanEndDate,
      },
    });
    return { message: `Plan change to ${newPricingPlan.name} scheduled for next billing cycle.` };
  } else {
    // Current cycle HAS ended or never existed, change immediately
    // This part is simplified. In a real app, you'd handle prorations.
    const subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
    
    await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPricingPlan.id.toString(), // This needs to be the Stripe Price ID, not your internal plan ID
      }],
      proration_behavior: 'always_invoice', // Or 'create_prorations'
    });

    // Update Tenant immediately
    const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        pricingPlanId: newPricingPlan.id,
        currentPlanStartDate: now,
        currentPlanEndDate: oneMonthLater,
        nextPlanId: null,
        nextPlanActivationDate: null,
        active: true
      },
    });
    return { message: `Plan successfully changed to ${newPricingPlan.name}.` };
  }
};

export const makePayment = async (tenantId: string, invoiceId: number, amount: number, method: string = 'CARD', userId?: string) => {
  // Get tenant settings for currency conversion
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  });
  
  const tenantCurrency = tenant?.settings?.currency || 'USD';
  
  // Verify invoice belongs to tenant
  const invoice = await prisma.invoice.findFirst({
    where: { 
      id: invoiceId,
      tenantId 
    },
    include: { payments: true }
  });

  if (!invoice) {
    throw new Error('Invoice not found or does not belong to this tenant.');
  }

  // Convert amounts to tenant currency for validation
  let invoiceAmount = invoice.amount;
  let totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  let currencySymbol = '$';
  
  if (tenantCurrency !== 'USD') {
    const { convertCurrency } = await import('../services/currencyService');
    
    // Convert invoice amount
    const convertedInvoice = await convertCurrency(invoice.amount, 'USD', tenantCurrency);
    invoiceAmount = convertedInvoice.convertedAmount;
    
    // Convert total payments
    const convertedPayments = await Promise.all(
      invoice.payments.map(payment => convertCurrency(payment.amount, 'USD', tenantCurrency))
    );
    totalPaid = convertedPayments.reduce((sum, converted) => sum + converted.convertedAmount, 0);
    
    // Set currency symbol
    const symbols: { [key: string]: string } = {
      'INR': '₹', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
    };
    currencySymbol = symbols[tenantCurrency] || tenantCurrency;
  }
  
  const remainingAmount = invoiceAmount - totalPaid;

  if (amount > remainingAmount) {
    throw new Error(`Payment amount cannot exceed remaining balance of ${currencySymbol}${remainingAmount.toFixed(2)}.`);
  }

  // Convert payment amount back to USD for storage
  let paymentAmountUSD = amount;
  if (tenantCurrency !== 'USD') {
    const { convertCurrency } = await import('../services/currencyService');
    const convertedPayment = await convertCurrency(amount, tenantCurrency, 'USD');
    paymentAmountUSD = convertedPayment.convertedAmount;
  }

  // Create payment record (store in USD)
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: paymentAmountUSD,
      paymentDate: new Date(),
      method,
      reference: `DEMO-${Date.now()}`, // Demo reference
      paidById: userId
    }
  });

  // Update invoice status if fully paid (check in converted currency)
  const newTotalPaid = totalPaid + amount;
  if (newTotalPaid >= invoiceAmount) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' }
    });

    // Reactivate tenant if they were deactivated
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { active: true }
    });
  }

  return { 
    message: 'Payment processed successfully',
    payment,
    remainingBalance: invoiceAmount - newTotalPaid
  };
};


import { Request, Response } from 'express';
import * as billingService from '../services/billingService';
import { convertCurrency } from '../services/currencyService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBillingHistory = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in request.' });
    }
    
    // Get tenant settings for currency
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true }
    });
    
    const tenantCurrency = tenant?.settings?.currency || 'USD';
    console.log('=== BILLING CURRENCY DEBUG ===');
    console.log('Tenant ID:', tenantId);
    console.log('Tenant Settings:', tenant?.settings);
    console.log('Tenant Currency:', tenantCurrency);
    
    const invoices = await billingService.getBillingHistory(tenantId);
    console.log('Original Invoices Count:', invoices.length);
    
    // Convert currency for each invoice if needed
    if (tenantCurrency !== 'USD') {
      console.log('Converting from USD to', tenantCurrency);
      const convertedInvoices = await Promise.all(
        invoices.map(async (invoice: any) => {
          console.log('Converting Invoice #' + invoice.id + ' - Original Amount: $' + invoice.amount);
          const convertedAmount = await convertCurrency(invoice.amount, 'USD', tenantCurrency);
          console.log('Converted Amount:', convertedAmount);
          
          const convertedPayments = await Promise.all(
            (invoice.payments || []).map(async (payment: any) => {
              console.log('Converting Payment - Original Amount: $' + payment.amount);
              const convertedPayment = await convertCurrency(payment.amount, 'USD', tenantCurrency);
              console.log('Converted Payment:', convertedPayment);
              return {
                ...payment,
                convertedAmount: convertedPayment
              };
            })
          );
          
          return {
            ...invoice,
            convertedAmount,
            payments: convertedPayments
          };
        })
      );
      console.log('=== END BILLING DEBUG ===');
      res.json(convertedInvoices);
    } else {
      console.log('No conversion needed - using USD');
      console.log('=== END BILLING DEBUG ===');
      res.json(invoices);
    }
  } catch (error: any) {
    console.error('Billing History Error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentPlanDetails = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in request.' });
    }
    const planDetails = await billingService.getCurrentPlanDetails(tenantId);
    res.json(planDetails);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const subscribeToPlan = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { planId, paymentMethodId } = req.body; // paymentMethodId from frontend (Stripe)

    if (!tenantId || !planId || !paymentMethodId) {
      return res.status(400).json({ message: 'Missing required fields: tenantId, planId, paymentMethodId.' });
    }

    const subscriptionResult = await billingService.subscribeToPlan(tenantId, planId, paymentMethodId);
    res.status(200).json(subscriptionResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePlan = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const { newPlanId } = req.body;

    if (!tenantId || !newPlanId) {
      return res.status(400).json({ message: 'Missing required fields: tenantId, newPlanId.' });
    }

    const changeResult = await billingService.changePlan(tenantId, newPlanId);
    res.status(200).json(changeResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const makePayment = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    const { invoiceId, amount, method } = req.body;

    if (!tenantId || !invoiceId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: invoiceId, amount.' });
    }

    const paymentResult = await billingService.makePayment(tenantId, invoiceId, amount, method || 'CARD', userId);
    res.status(200).json(paymentResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

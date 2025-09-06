import { Request, Response } from 'express';
import * as billingService from '../services/billingService';

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
    const invoices = await billingService.getBillingHistory(tenantId);
    
    // Convert currency using utility
    if (tenantCurrency !== 'USD') {
      const { CurrencyConverter } = await import('../utils/currencyConverter');
      const converter = new CurrencyConverter(tenantCurrency);
      
      const convertedInvoices = await Promise.all(
        invoices.map(async (invoice: any) => {
          const convertedAmount = await converter.convertFromBase(invoice.amount);
          const convertedPayments = await converter.convertArray(invoice.payments || [], 'amount');
          
          return {
            ...invoice,
            convertedAmount,
            payments: convertedPayments
          };
        })
      );
      res.json(convertedInvoices);
    } else {
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
    const { invoiceId, amount, method } = req.body;

    if (!tenantId || !invoiceId || !amount) {
      return res.status(400).json({ message: 'Missing required fields: invoiceId, amount.' });
    }

    const paymentResult = await billingService.makePayment(tenantId, invoiceId, amount, method || 'CARD');
    res.status(200).json(paymentResult);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

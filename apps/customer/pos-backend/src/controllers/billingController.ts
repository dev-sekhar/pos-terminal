import { Request, Response } from 'express';
import * as billingService from '../services/billingService';

export const getBillingHistory = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in request.' });
    }
    const invoices = await billingService.getBillingHistory(tenantId);
    res.json(invoices);
  } catch (error: any) {
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

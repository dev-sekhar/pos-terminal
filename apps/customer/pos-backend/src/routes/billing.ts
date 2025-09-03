import { Router } from 'express';
import * as billingController from '../controllers/billingController';

const router = Router();

// All billing routes are protected by app.ts

// GET /api/billing/history - Get tenant's billing history (invoices)
router.get('/history', billingController.getBillingHistory);

// GET /api/billing/current-plan - Get tenant's current plan details
router.get('/current-plan', billingController.getCurrentPlanDetails);

// POST /api/billing/subscribe - Subscribe to a new plan
router.post('/subscribe', billingController.subscribeToPlan);

// POST /api/billing/change-plan - Change to a different plan
router.post('/change-plan', billingController.changePlan);

// POST /api/billing/make-payment - Make a payment for an invoice
router.post('/make-payment', billingController.makePayment);

export default router;
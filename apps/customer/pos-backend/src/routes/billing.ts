import { Router } from 'express';
import * as billingController from '../controllers/billingController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// All billing routes require MANAGE_BILLING permission (ADMIN only)
const billingAuth = rbacMiddleware(PERMISSIONS.MANAGE_BILLING);

// GET /api/billing/history - Get tenant's billing history (invoices)
router.get('/history', billingAuth, billingController.getBillingHistory);

// GET /api/billing/current-plan - Get tenant's current plan details
router.get('/current-plan', billingAuth, billingController.getCurrentPlanDetails);

// POST /api/billing/subscribe - Subscribe to a new plan
router.post('/subscribe', billingAuth, billingController.subscribeToPlan);

// POST /api/billing/change-plan - Change to a different plan
router.post('/change-plan', billingAuth, billingController.changePlan);

// POST /api/billing/make-payment - Make a payment for an invoice
router.post('/make-payment', billingAuth, billingController.makePayment);

export default router;
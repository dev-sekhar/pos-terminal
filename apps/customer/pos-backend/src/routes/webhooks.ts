import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';

const router = Router();

// Stripe webhook endpoint
// This endpoint needs to be raw, without express.json() parsing, as Stripe sends raw body
// It will be handled by a specific middleware in app.ts
router.post('/stripe', webhookController.handleStripeWebhook);

export default router;
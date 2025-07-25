import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

// This single GET endpoint will provide all the data for the dashboard
router.get('/metrics', dashboardController.getMetrics);

export default router;
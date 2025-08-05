import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// This single GET endpoint will provide all the data for the dashboard.
// All authenticated users have the VIEW_DASHBOARD permission, so this is accessible to everyone who can log in.
router.get('/metrics', rbacMiddleware(PERMISSIONS.VIEW_DASHBOARD), dashboardController.getMetrics);

export default router;
import { Router } from 'express';
import * as reportsController from '../controllers/reportsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// This route is protected by the VIEW_REPORTS permission, which both ADMIN and MANAGER have.
router.get('/', rbacMiddleware(PERMISSIONS.VIEW_REPORTS), reportsController.getReports);

export default router;
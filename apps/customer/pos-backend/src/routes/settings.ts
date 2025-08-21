import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';
import { validate } from '../middleware/validate';
import { settingsSchema } from '@pos-terminal/schemas/dist/settingsSchema';

const router = Router();

// According to our central permissions config:
// - VIEW_REPORTS is available to ADMIN and MANAGER.
// - MANAGE_SETTINGS is available only to ADMIN.
// This perfectly matches the intended security model.

router.get('/', rbacMiddleware(PERMISSIONS.VIEW_REPORTS), settingsController.getSettings);

router.put('/', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), validate(settingsSchema), settingsController.updateSettings);

export default router;
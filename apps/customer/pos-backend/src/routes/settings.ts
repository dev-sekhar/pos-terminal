import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { checkRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

// --- THIS IS THE FIX ---

// Admins and Managers can VIEW the settings
router.get('/', checkRoles([Role.ADMIN, Role.MANAGER]), settingsController.getSettings);

// Only Admins can UPDATE the settings
router.put('/', checkRoles([Role.ADMIN]), settingsController.updateSettings);

export default router;
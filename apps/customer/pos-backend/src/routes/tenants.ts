import { Router } from 'express';
import * as tenantsController from '../controllers/tenantsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// --- THIS IS THE CRITICAL FIX ---
// This route is protected by the standard auth/tenant middleware (in app.ts),
// but it has NO additional RBAC middleware. This is correct.
router.get('/public-info', tenantsController.getPublicInfo);


// --- ALL OTHER ROUTES IN THIS FILE ARE ADMIN-ONLY ---
// We create a single middleware for all admin-level tenant management.
const canManageTenant = rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS);

router.post('/', canManageTenant, tenantsController.createTenant);
router.get('/', canManageTenant, tenantsController.listTenants);
router.get('/:id', canManageTenant, tenantsController.getTenantById);
router.put('/:id', canManageTenant, tenantsController.updateTenant);
router.delete('/:id', canManageTenant, tenantsController.deleteTenant);

export default router;
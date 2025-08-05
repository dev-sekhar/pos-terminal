import { Router } from 'express';
import * as tenantsController from '../controllers/tenantsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// These routes allow an admin to manage their own tenant's information.
// We protect them with the MANAGE_SETTINGS permission, which is ADMIN-only.
// Note: The public /api/register-tenant route handles initial creation.

router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), tenantsController.listTenants);
router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), tenantsController.createTenant); // Note: Likely redundant with register-tenant
router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), tenantsController.getTenantById);
router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), tenantsController.updateTenant);
router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SETTINGS), tenantsController.deleteTenant);

export default router;
import { Router } from 'express';
import * as suppliersController from '../controllers/suppliersController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// Protect all supplier routes with the 'manage:suppliers' permission.
// According to our central config, this is available to ADMIN and MANAGER roles.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), suppliersController.listSuppliers);

router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), suppliersController.createSupplier);

router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), suppliersController.deleteSupplier);

export default router;
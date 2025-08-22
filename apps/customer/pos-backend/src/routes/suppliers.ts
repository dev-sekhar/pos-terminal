import { Router } from 'express';
import * as suppliersController from '../controllers/suppliersController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';
import { validate } from '../middleware/validate';
import { supplierSchema } from '@pos-terminal/schemas/dist/supplierSchema';

const router = Router();

// Protect all supplier routes with the 'manage:suppliers' permission.
// According to our central config, this is available to ADMIN and MANAGER roles.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), suppliersController.listSuppliers);

router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), validate(supplierSchema), suppliersController.createSupplier);

router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), validate(supplierSchema), suppliersController.updateSupplier);

router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_SUPPLIERS), suppliersController.deleteSupplier);

export default router;
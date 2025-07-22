import { Router } from 'express';
import * as tenantsController from '../controllers/tenantsController';

const router = Router();

router.post('/', tenantsController.createTenant);
router.get('/', tenantsController.listTenants);
router.get('/:id', tenantsController.getTenantById);
router.put('/:id', tenantsController.updateTenant);
router.delete('/:id', tenantsController.deleteTenant);

export default router; 
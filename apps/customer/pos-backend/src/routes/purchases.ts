import { Router } from 'express';
import * as purchasesController from '../controllers/purchasesController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// Protect all purchase routes with the 'manage:purchases' permission.
// According to our central config, this is available to ADMIN and MANAGER roles.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.listPurchases);
router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.createPurchase);
router.get('/utils/new-ponumber', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.getNewPONumber);
router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.getPurchaseById);
router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.updatePurchase);
router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PURCHASES), purchasesController.deletePurchase);

export default router;
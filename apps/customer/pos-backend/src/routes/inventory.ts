import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// --- THIS IS THE FIX ---
// Define more specific routes BEFORE general, parameterized routes.
router.get('/for-sales', rbacMiddleware(PERMISSIONS.CREATE_SALES), inventoryController.listInventoryForSales);

// Now, define the general routes.
router.get('/', rbacMiddleware(PERMISSIONS.CREATE_SALES), inventoryController.listInventory);

const canManageInventory = rbacMiddleware(PERMISSIONS.MANAGE_INVENTORY);
router.post('/', canManageInventory, inventoryController.createInventory);

// This route will now only be matched if the path is not '/for-sales'.
router.get('/:id', canManageInventory, inventoryController.getInventoryById);

router.put('/:id', canManageInventory, inventoryController.updateInventory);
router.delete('/:id', canManageInventory, inventoryController.deleteInventory);

export default router;
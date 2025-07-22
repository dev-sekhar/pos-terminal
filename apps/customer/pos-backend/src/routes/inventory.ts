import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';

const router = Router();

router.get('/', inventoryController.listInventory);
router.post('/', inventoryController.createInventory);
router.get('/:id', inventoryController.getInventoryById);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

export default router; 
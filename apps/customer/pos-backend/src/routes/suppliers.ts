import { Router } from 'express';
import * as suppliersController from '../controllers/suppliersController';

const router = Router();

router.get('/', suppliersController.listSuppliers);
router.post('/', suppliersController.createSupplier);
router.get('/:id', suppliersController.getSupplierById);
router.put('/:id', suppliersController.updateSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

export default router; 
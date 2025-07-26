import { Router } from 'express';
import * as suppliersController from '../controllers/suppliersController';

const router = Router();

// Define the routes for suppliers
// These will match the endpoints defined in the suppliersController
router.get('/', suppliersController.listSuppliers);
router.post('/', suppliersController.createSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

export default router;
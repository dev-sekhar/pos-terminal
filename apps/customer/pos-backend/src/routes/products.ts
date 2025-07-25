import { Router } from 'express';
import * as productsController from '../controllers/productsController';

const router = Router();

// Standard CRUD
router.get('/', productsController.listProducts);
router.post('/', productsController.createProduct);
router.get('/:id', productsController.getProductById);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

// Advanced Routes
router.get('/utils/new-code', productsController.getNewProductCode);
router.post('/import', productsController.importProducts);

export default router;
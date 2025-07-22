import { Router } from 'express';
import * as productsController from '../controllers/productsController';

const router = Router();

// GET /api/products
router.get('/', productsController.listProducts);

// POST /api/products
router.post('/', productsController.createProduct);

// GET /api/products/:id
router.get('/:id', productsController.getProductById);

// PUT /api/products/:id
router.put('/:id', productsController.updateProduct);

// DELETE /api/products/:id (soft delete)
router.delete('/:id', productsController.deleteProduct);

export default router; 
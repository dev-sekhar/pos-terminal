import { Router } from 'express';
import * as productsController from '../controllers/productsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// According to our central permissions config, ADMIN and MANAGER roles have the 'manage:products' permission.
// We apply this middleware to every route to ensure only those roles can perform these actions.

// Standard CRUD routes
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.listProducts);
router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.createProduct);
router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.getProductById);
router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.updateProduct);
router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.deleteProduct);

// Advanced Routes
router.get('/utils/new-code', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.getNewProductCode);
router.post('/import', rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS), productsController.importProducts);

export default router;
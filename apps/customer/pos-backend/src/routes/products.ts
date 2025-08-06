import { Router } from 'express';
import * as productsController from '../controllers/productsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// --- THIS IS THE CORRECT PERMISSION FOR VIEWING ---
// Managers and Admins have VIEW_PRODUCTS.
router.get('/', rbacMiddleware(PERMISSIONS.VIEW_PRODUCTS), productsController.listProducts);
router.get('/:id', rbacMiddleware(PERMISSIONS.VIEW_PRODUCTS), productsController.getProductById);

// --- ONLY ADMINS CAN MANAGE (CREATE/EDIT/DELETE) ---
const canManageProducts = rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS);
router.post('/', canManageProducts, productsController.createProduct);
router.put('/:id', canManageProducts, productsController.updateProduct);
router.delete('/:id', canManageProducts, productsController.deleteProduct);
router.get('/utils/new-code', canManageProducts, productsController.getNewProductCode);
router.post('/import', canManageProducts, productsController.importProducts);

export default router;
import { Router } from 'express';
import * as productsController from '../controllers/productsController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';
import { productSchema } from '@pos-terminal/schemas';
import { validate } from '../middleware/validate';

const router = Router();

// --- THIS IS THE CORRECT PERMISSION FOR VIEWING ---
// Managers and Admins have VIEW_PRODUCTS.
router.get('/', rbacMiddleware(PERMISSIONS.VIEW_PRODUCTS), productsController.listProducts);

// --- ONLY ADMINS CAN MANAGE (CREATE/EDIT/DELETE) ---
const canManageProducts = rbacMiddleware(PERMISSIONS.MANAGE_PRODUCTS);
router.get('/utils/new-code', canManageProducts, productsController.getNewProductCode);
router.post('/import', canManageProducts, productsController.importProducts);
router.post('/', canManageProducts, validate(productSchema), productsController.createProduct);

// Parameterized routes must come last
router.get('/:id', rbacMiddleware(PERMISSIONS.VIEW_PRODUCTS), productsController.getProductById);
router.put('/:id', canManageProducts, validate(productSchema), productsController.updateProduct);
router.delete('/:id', canManageProducts, productsController.deleteProduct);

export default router;
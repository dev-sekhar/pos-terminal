import { Router } from 'express';
import * as categoriesController from '../controllers/categoriesController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// According to our central permissions config, ADMIN and MANAGER roles have the 'manage:categories' permission.
// We protect every route with this middleware to ensure proper authorization.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_CATEGORIES), categoriesController.listCategories);

router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_CATEGORIES), categoriesController.createCategory);

router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_CATEGORIES), categoriesController.getCategoryById);

router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_CATEGORIES), categoriesController.updateCategory);

router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_CATEGORIES), categoriesController.deleteCategory);

export default router;
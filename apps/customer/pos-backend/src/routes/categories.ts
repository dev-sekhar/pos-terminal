import { Router } from 'express';
import * as categoriesController from '../controllers/categoriesController';

const router = Router();

router.get('/', categoriesController.listCategories);
router.post('/', categoriesController.createCategory);
router.get('/:id', categoriesController.getCategoryById);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export default router; 
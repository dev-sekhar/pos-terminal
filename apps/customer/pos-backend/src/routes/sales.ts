import { Router } from 'express';
import * as salesController from '../controllers/salesController';

const router = Router();

router.get('/', salesController.listSales);
router.post('/', salesController.createSale);
router.get('/:id', salesController.getSaleById);
router.put('/:id', salesController.updateSale);
router.delete('/:id', salesController.deleteSale);

export default router; 
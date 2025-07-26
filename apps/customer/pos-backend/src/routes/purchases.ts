import { Router } from 'express';
import * as purchasesController from '../controllers/purchasesController';

const router = Router();

router.get('/utils/new-ponumber', purchasesController.getNewPONumber); // New route
router.get('/', purchasesController.listPurchases);
router.post('/', purchasesController.createPurchase);
router.get('/:id', purchasesController.getPurchaseById);
router.put('/:id', purchasesController.updatePurchase);
router.delete('/:id', purchasesController.deletePurchase);

export default router;
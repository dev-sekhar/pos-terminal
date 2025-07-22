import { Router } from 'express';
import * as branchesController from '../controllers/branchesController';

const router = Router();

router.get('/', branchesController.listBranches);
router.post('/', branchesController.createBranch);
router.get('/:id', branchesController.getBranchById);
router.put('/:id', branchesController.updateBranch);
router.delete('/:id', branchesController.deleteBranch);

export default router; 
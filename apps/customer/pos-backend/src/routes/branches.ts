import { Router } from 'express';
import * as branchesController from '../controllers/branchesController';

// 1. Import our new permission-based middleware.
import { rbacMiddleware } from '../middleware/rbacMiddleware';
// 2. Import the PERMISSIONS object from our single source of truth.
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// All branch management actions are now protected by the 'manage:branches' permission.
// According to our central permissions config, only ADMINs have this permission.

router.get('/my-branch', branchesController.getMyBranch);

router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.listBranches);

router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.createBranch);

router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.getBranchById);

router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.updateBranch);

router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.deleteBranch);

// Any user who can manage inventory should be able to see the list of branches.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_INVENTORY), branchesController.listBranches);

export default router;
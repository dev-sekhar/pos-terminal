import { Router } from 'express';
import * as branchesController from '../controllers/branchesController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { PERMISSIONS } from '@pos-terminal/permissions';
import { validate } from '../middleware/validate';
import { branchSchema } from '@pos-terminal/schemas';

const router = Router();

// --- Public / Low-privilege routes ---
// Any authenticated user can get their own branch info. No RBAC needed beyond auth.
router.get('/my-branch', branchesController.getMyBranch);

// --- Manager & Admin routes ---
// Any user who can manage inventory (Manager or Admin) can get the list of all branches.
// This is now the single, definitive route for GET /.
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_INVENTORY), branchesController.listBranches);

// --- Admin-only routes for branch management ---
// Only Admins can view a specific branch by ID.
router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.getBranchById);

// Only Admins can create a new branch, and the request body MUST be validated.
router.post(
  '/', 
  rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), 
  validate(branchSchema), 
  branchesController.createBranch
);

// Only Admins can update a branch, and the request body MUST be validated.
router.put(
  '/:id', 
  rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), 
  validate(branchSchema), 
  branchesController.updateBranch
);

// Only Admins can delete a branch.
router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_BRANCHES), branchesController.deleteBranch);

export default router;
import { Router } from 'express';
import * as usersController from '../controllers/usersController';

// --- FIXED IMPORTS ---
// 1. Import our new permission-based middleware.
import { rbacMiddleware } from '../middleware/rbacMiddleware';
// 2. Import the PERMISSIONS object from our single source of truth.
import { PERMISSIONS } from '@pos-terminal/permissions';

const router = Router();

// We now use the permission-based middleware.
// This enforces our business rule that only roles with the 'manage:users'
// permission (which is only ADMIN) can access these endpoints.

// GET /api/users - List all users in the tenant
router.get('/', rbacMiddleware(PERMISSIONS.MANAGE_USERS), usersController.listUsers);

// POST /api/users - Create a new user
router.post('/', rbacMiddleware(PERMISSIONS.MANAGE_USERS), usersController.createUser);

// GET /api/users/:id - Get a single user's details
router.get('/:id', rbacMiddleware(PERMISSIONS.MANAGE_USERS), usersController.getUserById);

// PUT /api/users/:id - Update a user's details (e.g., their role or branch)
router.put('/:id', rbacMiddleware(PERMISSIONS.MANAGE_USERS), usersController.updateUser);

// DELETE /api/users/:id - Delete a user from the tenant
router.delete('/:id', rbacMiddleware(PERMISSIONS.MANAGE_USERS), usersController.deleteUser);

export default router;
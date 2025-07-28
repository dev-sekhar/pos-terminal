import { Router } from 'express';
import * as usersController from '../controllers/usersController';
import { checkRoles } from '../middleware/rbacMiddleware';
import { Role } from '@prisma/client'; // Import the Role enum
import { permissions } from '../utils/permissions'; // Import permissions if needed

const router = Router();

// 2. APPLY THE MIDDLEWARE TO EACH ROUTE
// Only Admins and Managers can list users
router.get('/', checkRoles([Role.ADMIN, Role.MANAGER]), usersController.listUsers);

// Only Admins can create new users
router.post('/', checkRoles([Role.ADMIN]), usersController.createUser);

// Admins and Managers can view a specific user
router.get('/:id', checkRoles([Role.ADMIN, Role.MANAGER]), usersController.getUserById);

// Only Admins can update a user
router.put('/:id', checkRoles([Role.ADMIN]), usersController.updateUser);

// Only Admins can delete a user
router.delete('/:id', checkRoles([Role.ADMIN]), usersController.deleteUser);

router.get('/', checkRoles(permissions.VIEW_USERS), usersController.listUsers);
router.post('/', checkRoles(permissions.MANAGE_USERS), usersController.createUser);
router.get('/:id', checkRoles(permissions.VIEW_USERS), usersController.getUserById);
router.put('/:id', checkRoles(permissions.MANAGE_USERS), usersController.updateUser);
router.delete('/:id', checkRoles(permissions.MANAGE_USERS), usersController.deleteUser);

export default router;
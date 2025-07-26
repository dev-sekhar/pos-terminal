import { Router } from 'express';
import * as usersController from '../controllers/usersController';

const router = Router();

router.get('/', usersController.listUsers);
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;
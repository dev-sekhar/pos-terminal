import { Router } from 'express';
// --- FIX 1: Import the entire controller and the middleware ---
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// This is a public route, no middleware needed.
router.post('/login', authController.login);

// This is a protected route. It requires a valid token.
// The authMiddleware will run first, validating the token and attaching req.user.
// If it passes, it will then call authController.getProfile.
router.get('/profile', authMiddleware, authController.getProfile);

export default router;
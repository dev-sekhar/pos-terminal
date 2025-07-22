import { Router } from 'express';
const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint' });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint' });
});

export default router; 
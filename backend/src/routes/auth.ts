import express, { Request, Response } from 'express';
import { signup, login } from '../services/authService.js';

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = await signup(email, password);

  if ('error' in result) {
    return res.status(400).json(result);
  }

  res.status(201).json({
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
    token: result.token,
  });
});

/**
 * POST /auth/login
 * Authenticate user and get JWT token
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = await login(email, password);

  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json({
    success: true,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
    token: result.token,
  });
});

/**
 * POST /auth/verify
 * Verify JWT token
 */
router.post('/verify', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const { verifyToken } = require('../services/authService.js');
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.json({
    success: true,
    payload,
  });
});

export default router;

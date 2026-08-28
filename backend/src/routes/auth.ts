import express, { Request, Response } from 'express';
import { signup, login, resetPassword, verifyToken } from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

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

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.json({
    success: true,
    payload,
  });
});

/**
 * POST /auth/password-reset
 * Reset user password with current password verification
 * Requires authentication header
 */
router.post('/password-reset', requireAuth, async (req: Request & any, res: Response) => {
  const userId = req.user?.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const result = await resetPassword(userId, currentPassword, newPassword);

    if ('error' in result) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to reset password',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

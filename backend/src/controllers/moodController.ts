import type { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { saveMoodCheckin, getMoodTrend, hasCheckedInToday } from '../services/moodService.js';
import { logger } from '../utils/logger.js';

/**
 * POST /mood/checkin
 * Record a daily mood check-in
 * User ID comes from authenticated token
 */
export async function handleMoodCheckin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { moodScore, moodEmoji } = req.body;

    const score = Number(moodScore);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      res.status(400).json({ error: 'moodScore must be an integer between 1 and 5' });
      return;
    }

    const checkin = saveMoodCheckin(userId, score, moodEmoji || '');
    res.json({ success: true, checkin });
  } catch (error) {
    logger.error('Error saving mood checkin', error);
    res.status(500).json({
      error: 'Failed to save mood checkin',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /mood/trend?days=7
 * Get authenticated user's mood trend over the last N days
 * User ID comes from authenticated token
 */
export async function handleGetMoodTrend(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const days = Number(req.query.days) || 7;

    const trend = getMoodTrend(userId, days);
    res.json(trend);
  } catch (error) {
    logger.error('Error fetching mood trend', error);
    res.status(500).json({
      error: 'Failed to fetch mood trend',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /mood/status
 * Whether the user has already checked in today (used to show the prompt once/day)
 * User ID comes from authenticated token
 */
export async function handleGetMoodStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    res.json({ checkedInToday: hasCheckedInToday(userId) });
  } catch (error) {
    logger.error('Error fetching mood status', error);
    res.status(500).json({
      error: 'Failed to fetch mood status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default { handleMoodCheckin, handleGetMoodTrend, handleGetMoodStatus };

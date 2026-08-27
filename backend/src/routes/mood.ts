import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleMoodCheckin, handleGetMoodTrend, handleGetMoodStatus } from '../controllers/moodController.js';

const router = express.Router();

/**
 * POST /mood/checkin
 * Record a daily mood check-in
 * Requires: Authorization header with Bearer token
 *
 * Request body: { moodScore: number (1-5); moodEmoji: string }
 */
router.post('/checkin', requireAuth, handleMoodCheckin);

/**
 * GET /mood/status
 * Whether the user has already checked in today
 * Requires: Authorization header with Bearer token
 */
router.get('/status', requireAuth, handleGetMoodStatus);

/**
 * GET /mood/trend?days=7
 * Mood trend over the last N days (default 7)
 * Requires: Authorization header with Bearer token
 */
router.get('/trend', requireAuth, handleGetMoodTrend);

export default router;

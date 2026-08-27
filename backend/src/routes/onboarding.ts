import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleSavePreferences, handleGetPreferences } from '../controllers/onboardingController.js';

const router = express.Router();

/**
 * POST /onboarding/preferences
 * Save user onboarding preferences
 * Requires: Authorization header with Bearer token
 *
 * Request body:
 * {
 *   preferredSupportStyle: 'family_community' | 'professional' | 'solo' | 'mixed';
 *   topicsToAvoid?: string[];
 *   languages?: string[];
 *   culturalContext?: string;
 * }
 *
 * Response:
 * {
 *   success: true;
 *   userId: string;
 *   preferences: UserPreferences;
 * }
 */
router.post('/preferences', requireAuth, handleSavePreferences);

/**
 * GET /onboarding/preferences
 * Retrieve authenticated user's onboarding preferences
 * Requires: Authorization header with Bearer token
 *
 * Response: UserPreferences object
 */
router.get('/preferences', requireAuth, handleGetPreferences);

export default router;

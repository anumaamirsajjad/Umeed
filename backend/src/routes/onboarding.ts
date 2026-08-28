import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleSavePreferences, handleGetPreferences, handleGetOnboardingStatus, handleUpdatePreferences } from '../controllers/onboardingController.js';

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
 *   topicsOfConcern?: string[];
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

/**
 * GET /onboarding/status
 * Check if user has completed onboarding
 * Requires: Authorization header with Bearer token
 *
 * Response: { completed: boolean; preferences: UserPreferences | null }
 */
router.get('/status', requireAuth, handleGetOnboardingStatus);

/**
 * PUT /onboarding/preferences
 * Update existing user preferences
 * Requires: Authorization header with Bearer token
 *
 * Response:
 * {
 *   success: true;
 *   preferences: UserPreferences;
 * }
 */
router.put('/preferences', requireAuth, handleUpdatePreferences);

export default router;

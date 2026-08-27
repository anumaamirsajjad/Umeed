import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  handleSaveSafetyPlan,
  handleGetSafetyPlan,
  handleGetSuggestions,
  handleExportSafetyPlan,
} from '../controllers/safetyPlanController.js';

const router = express.Router();

/**
 * POST /safety-plan
 * Create or update a user's safety plan
 * Requires: Authorization header with Bearer token
 *
 * Request body:
 * {
 *   warningSigns?: string[];
 *   copingStrategies?: string[];
 *   trustedContacts?: TrustedContact[];
 *   reasonsToStaySafe?: string[];
 * }
 */
router.post('/', requireAuth, handleSaveSafetyPlan);

/**
 * GET /safety-plan/suggestions
 * AI-suggested draft entries based on patterns learned from chat.
 * Requires: Authorization header with Bearer token
 */
router.get('/suggestions', requireAuth, handleGetSuggestions);

/**
 * GET /safety-plan/export
 * Export the user's safety plan as a PDF
 * Requires: Authorization header with Bearer token
 */
router.get('/export', requireAuth, handleExportSafetyPlan);

/**
 * GET /safety-plan
 * Retrieve authenticated user's safety plan
 * Requires: Authorization header with Bearer token
 */
router.get('/', requireAuth, handleGetSafetyPlan);

export default router;

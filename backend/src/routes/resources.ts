import express from 'express';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { handleGetResources, handleSearchResources } from '../controllers/resourcesController.js';

const router = express.Router();

/**
 * GET /resources
 * Get crisis resources with optional filtering
 *
 * Query params:
 * - region?: 'north-america' | 'europe' | 'asia-pacific' | 'south-asia' | 'global'
 * - type?: 'crisis_hotline' | 'professional' | 'support_group' | 'online_resource'
 * - city?: string (e.g. 'Karachi') — resources with no city are nationwide and always included
 *
 * Public route — no login required. If a valid Bearer token is present
 * (optionalAuth), personalized matching uses that authenticated user's
 * preferences; otherwise matching is skipped, same as today for an
 * anonymous visitor.
 *
 * Response:
 * {
 *   matched: CrisisResource[],  // Resources matching user's context
 *   other: CrisisResource[]     // All other resources
 * }
 */
router.get('/', optionalAuth, handleGetResources);

/**
 * GET /resources/search
 * Search for resources by name, description, or country
 *
 * Query params:
 * - q: string (search query, min 2 characters)
 *
 * Response: CrisisResource[]
 */
router.get('/search', handleSearchResources);

export default router;

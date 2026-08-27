import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleChat, handleNewChat } from '../controllers/chatController.js';

const router = express.Router();

/**
 * POST /chat
 * Send a message to Claude and get a response
 * Requires: Authorization header with Bearer token
 *
 * Request body:
 * {
 *   message: string;        // User's message
 *   preferences?: {         // Optional user preferences from onboarding
 *     preferredSupportStyle?: 'family_community' | 'professional' | 'solo' | 'mixed';
 *     topicsToAvoid?: string[];
 *     languages?: string[];
 *     culturalContext?: string;
 *   }
 * }
 *
 * Response:
 * {
 *   id: string;                    // Message ID
 *   message: string;               // Claude's response
 *   isCrisis: boolean;             // Whether crisis language detected
 *   crisisAlert?: {                // Alert if crisis detected
 *     triggered: boolean;
 *     severity: 'high' | 'critical';
 *     message: string;
 *     resources: CrisisResource[]; // Crisis resources to show
 *   }
 * }
 */
router.post('/', requireAuth, handleChat);

/**
 * POST /chat/new
 * Clears server-side conversation memory for this user, starting a fresh chat.
 * Requires: Authorization header with Bearer token
 */
router.post('/new', requireAuth, handleNewChat);

export default router;

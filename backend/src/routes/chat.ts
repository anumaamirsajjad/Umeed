import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { handleChat } from '../controllers/chatController.js';

const router = express.Router();

/**
 * POST /chat
 * Send a message to Claude and get a response
 * Requires: Authorization header with Bearer token
 *
 * Request body:
 * {
 *   message: string;        // User's message
 *   conversationId?: string; // Existing conversation to continue; omit to start a new one
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
 *   conversationId: string;        // Conversation this message belongs to
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

export default router;

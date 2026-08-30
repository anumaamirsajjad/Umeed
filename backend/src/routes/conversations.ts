import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  handleListConversations,
  handleGetConversation,
  handleRenameConversation,
  handleDeleteConversation,
} from '../controllers/conversationController.js';

const router = express.Router();

/**
 * GET /conversations
 * List the authenticated user's conversations, most recently updated first.
 * Requires: Authorization header with Bearer token
 *
 * Response: Conversation[]
 */
router.get('/', requireAuth, handleListConversations);

/**
 * GET /conversations/:id
 * Get one conversation and its full message history.
 * Requires: Authorization header with Bearer token
 *
 * Response: { conversation: Conversation; messages: StoredMessage[] }
 */
router.get('/:id', requireAuth, handleGetConversation);

/**
 * PATCH /conversations/:id
 * Rename a conversation.
 * Requires: Authorization header with Bearer token
 *
 * Request body: { title: string }
 * Response: Conversation
 */
router.patch('/:id', requireAuth, handleRenameConversation);

/**
 * DELETE /conversations/:id
 * Delete a conversation and all of its messages.
 * Requires: Authorization header with Bearer token
 *
 * Response: { success: true }
 */
router.delete('/:id', requireAuth, handleDeleteConversation);

export default router;

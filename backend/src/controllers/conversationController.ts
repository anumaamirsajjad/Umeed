import type { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  getMessages,
} from '../services/conversationService.js';
import { logger } from '../utils/logger.js';

/**
 * GET /conversations
 * List the authenticated user's conversations, most recently updated first.
 */
export async function handleListConversations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    logger.info(`Listing conversations for user: ${userId}`);

    const conversations = listConversations(userId);

    res.json(conversations);
  } catch (error) {
    logger.error('Error listing conversations', error);
    res.status(500).json({
      error: 'Failed to list conversations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /conversations/:id
 * Get one conversation and its full message history.
 */
export async function handleGetConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    logger.info(`Fetching conversation ${id} for user: ${userId}`);

    const conversation = getConversation(userId, id);

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = getMessages(id);

    res.json({ conversation, messages });
  } catch (error) {
    logger.error('Error fetching conversation', error);
    res.status(500).json({
      error: 'Failed to fetch conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PATCH /conversations/:id
 * Rename a conversation.
 */
export async function handleRenameConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'title is required' });
      return;
    }

    logger.info(`Renaming conversation ${id} for user: ${userId}`);

    const updatedConversation = renameConversation(userId, id, title.trim());

    if (!updatedConversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(updatedConversation);
  } catch (error) {
    logger.error('Error renaming conversation', error);
    res.status(500).json({
      error: 'Failed to rename conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * DELETE /conversations/:id
 * Delete a conversation and all of its messages.
 */
export async function handleDeleteConversation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    logger.info(`Deleting conversation ${id} for user: ${userId}`);

    const deleted = deleteConversation(userId, id);

    if (!deleted) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting conversation', error);
    res.status(500).json({
      error: 'Failed to delete conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  handleListConversations,
  handleGetConversation,
  handleRenameConversation,
  handleDeleteConversation,
};

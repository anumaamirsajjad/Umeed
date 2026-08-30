import { loadTable, saveTable } from '../db/jsonStore.js';
import type { Conversation, StoredMessage } from '../types/index.js';
import { logger } from '../utils/logger.js';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';
const DEFAULT_TITLE = 'New conversation';
const TITLE_MAX_LENGTH = 50;

/**
 * Create a new conversation for a user.
 */
export function createConversation(userId: string, title?: string): Conversation {
  try {
    const conversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: title || DEFAULT_TITLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    table[conversation.id] = conversation;
    saveTable(CONVERSATIONS_TABLE, table);

    logger.info(`Created conversation ${conversation.id} for user ${userId}`);
    return conversation;
  } catch (error) {
    logger.error('Error creating conversation', error);
    throw error;
  }
}

/**
 * List a user's conversations, most recently updated first.
 */
export function listConversations(userId: string): Conversation[] {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversations = Object.values(table)
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    logger.debug(`Fetching conversations for user ${userId}: found ${conversations.length}`);
    return conversations;
  } catch (error) {
    logger.error('Error listing conversations', error);
    return [];
  }
}

/**
 * Get a single conversation, ownership-checked. Returns null if not found
 * or not owned by userId (never leak another user's conversation by id).
 */
export function getConversation(userId: string, id: string): Conversation | null {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversation = table[id];
    if (!conversation || conversation.userId !== userId) {
      logger.warn(`Conversation ${id} not found or not owned by user ${userId}`);
      return null;
    }
    return conversation;
  } catch (error) {
    logger.error('Error fetching conversation', error);
    throw error;
  }
}

/**
 * Rename a conversation, ownership-checked.
 */
export function renameConversation(
  userId: string,
  id: string,
  title: string
): Conversation | null {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversation = table[id];
    if (!conversation || conversation.userId !== userId) {
      logger.warn(`Conversation ${id} not found or not owned by user ${userId}`);
      return null;
    }

    conversation.title = title;
    conversation.updatedAt = new Date();
    table[id] = conversation;
    saveTable(CONVERSATIONS_TABLE, table);

    logger.info(`Renamed conversation ${id} for user ${userId}`);
    return conversation;
  } catch (error) {
    logger.error('Error renaming conversation', error);
    throw error;
  }
}

/**
 * Delete a conversation and all of its messages, ownership-checked.
 * Returns true if something was deleted.
 */
export function deleteConversation(userId: string, id: string): boolean {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversation = table[id];
    if (!conversation || conversation.userId !== userId) {
      logger.warn(`Conversation ${id} not found or not owned by user ${userId}`);
      return false;
    }

    delete table[id];
    saveTable(CONVERSATIONS_TABLE, table);

    const messagesTable = loadTable<StoredMessage>(MESSAGES_TABLE);
    for (const [messageId, message] of Object.entries(messagesTable)) {
      if (message.conversationId === id) {
        delete messagesTable[messageId];
      }
    }
    saveTable(MESSAGES_TABLE, messagesTable);

    logger.info(`Deleted conversation ${id} and its messages for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting conversation', error);
    throw error;
  }
}

/**
 * Append a message to a conversation, bump the conversation's updatedAt,
 * and (for the first user message only) auto-title the conversation from
 * the raw message text.
 */
export function appendMessage(
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string
): StoredMessage {
  try {
    const message: StoredMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      userId,
      role,
      content,
      createdAt: new Date(),
    };

    const messagesTable = loadTable<StoredMessage>(MESSAGES_TABLE);
    messagesTable[message.id] = message;
    saveTable(MESSAGES_TABLE, messagesTable);

    const conversationsTable = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversation = conversationsTable[conversationId];
    if (conversation) {
      conversation.updatedAt = new Date();

      if (role === 'user' && conversation.title === DEFAULT_TITLE) {
        const isFirstUserMessage = !Object.values(messagesTable).some(
          m => m.conversationId === conversationId && m.role === 'user' && m.id !== message.id
        );
        if (isFirstUserMessage) {
          conversation.title =
            content.length > TITLE_MAX_LENGTH
              ? `${content.slice(0, TITLE_MAX_LENGTH)}…`
              : content;
        }
      }

      conversationsTable[conversationId] = conversation;
      saveTable(CONVERSATIONS_TABLE, conversationsTable);
    }

    logger.info(`Appended ${role} message to conversation ${conversationId}`);
    return message;
  } catch (error) {
    logger.error('Error appending message', error);
    throw error;
  }
}

/**
 * Get all messages in a conversation, oldest first.
 */
export function getMessages(conversationId: string): StoredMessage[] {
  try {
    const table = loadTable<StoredMessage>(MESSAGES_TABLE);
    return Object.values(table)
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    logger.error('Error fetching messages', error);
    throw error;
  }
}

/**
 * Get the content of the last `count` assistant messages in a conversation.
 */
export function getRecentAssistantMessages(conversationId: string, count = 3): string[] {
  try {
    return getMessages(conversationId)
      .filter(m => m.role === 'assistant')
      .slice(-count)
      .map(m => m.content);
  } catch (error) {
    logger.error('Error fetching recent assistant messages', error);
    throw error;
  }
}

/**
 * Read a conversation's detected language directly by id (no ownership
 * check — only called internally after the caller has already
 * ownership-checked the conversation). Best-effort: falls back to
 * undefined (no detected language) rather than failing the caller.
 */
export function getDetectedLanguage(conversationId: string): string | undefined {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    return table[conversationId]?.detectedLanguage;
  } catch (error) {
    logger.error('Error fetching detected language', error);
    return undefined;
  }
}

/**
 * Set a conversation's detected language. Best-effort metadata update —
 * logged and swallowed on failure rather than failing the caller.
 */
export function setDetectedLanguage(conversationId: string, language: string): void {
  try {
    const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
    const conversation = table[conversationId];
    if (!conversation) {
      logger.warn(`Conversation ${conversationId} not found, cannot set detected language`);
      return;
    }

    conversation.detectedLanguage = language;
    conversation.updatedAt = new Date();
    table[conversationId] = conversation;
    saveTable(CONVERSATIONS_TABLE, table);
  } catch (error) {
    logger.error('Error setting detected language', error);
  }
}

export default {
  createConversation,
  listConversations,
  getConversation,
  renameConversation,
  deleteConversation,
  appendMessage,
  getMessages,
  getRecentAssistantMessages,
  getDetectedLanguage,
  setDetectedLanguage,
};

import { loadTable, saveTable } from '../db/jsonStore.js';
import type { Conversation, StoredMessage } from '../types/index.js';

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';
const DEFAULT_TITLE = 'New conversation';
const TITLE_MAX_LENGTH = 50;

/**
 * Create a new conversation for a user.
 */
export function createConversation(userId: string, title?: string): Conversation {
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

  return conversation;
}

/**
 * List a user's conversations, most recently updated first.
 */
export function listConversations(userId: string): Conversation[] {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  return Object.values(table)
    .filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Get a single conversation, ownership-checked. Returns null if not found
 * or not owned by userId (never leak another user's conversation by id).
 */
export function getConversation(userId: string, id: string): Conversation | null {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  const conversation = table[id];
  if (!conversation || conversation.userId !== userId) {
    return null;
  }
  return conversation;
}

/**
 * Rename a conversation, ownership-checked.
 */
export function renameConversation(
  userId: string,
  id: string,
  title: string
): Conversation | null {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  const conversation = table[id];
  if (!conversation || conversation.userId !== userId) {
    return null;
  }

  conversation.title = title;
  conversation.updatedAt = new Date();
  table[id] = conversation;
  saveTable(CONVERSATIONS_TABLE, table);

  return conversation;
}

/**
 * Delete a conversation and all of its messages, ownership-checked.
 * Returns true if something was deleted.
 */
export function deleteConversation(userId: string, id: string): boolean {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  const conversation = table[id];
  if (!conversation || conversation.userId !== userId) {
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

  return true;
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

  return message;
}

/**
 * Get all messages in a conversation, oldest first.
 */
export function getMessages(conversationId: string): StoredMessage[] {
  const table = loadTable<StoredMessage>(MESSAGES_TABLE);
  return Object.values(table)
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get the content of the last `count` assistant messages in a conversation.
 */
export function getRecentAssistantMessages(conversationId: string, count = 3): string[] {
  return getMessages(conversationId)
    .filter(m => m.role === 'assistant')
    .slice(-count)
    .map(m => m.content);
}

/**
 * Read a conversation's detected language directly by id (no ownership
 * check — only called internally after the caller has already
 * ownership-checked the conversation).
 */
export function getDetectedLanguage(conversationId: string): string | undefined {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  return table[conversationId]?.detectedLanguage;
}

/**
 * Set a conversation's detected language.
 */
export function setDetectedLanguage(conversationId: string, language: string): void {
  const table = loadTable<Conversation>(CONVERSATIONS_TABLE);
  const conversation = table[conversationId];
  if (!conversation) {
    return;
  }

  conversation.detectedLanguage = language;
  conversation.updatedAt = new Date();
  table[conversationId] = conversation;
  saveTable(CONVERSATIONS_TABLE, table);
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

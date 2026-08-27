import type { ChatMessage } from '../types/index.js';

/**
 * In-memory, server-side conversation session store.
 *
 * Hackathon-scope: keyed by userId (one active session per user), lives only
 * for the process lifetime. Not trusted from/synced to frontend state, so a
 * page refresh doesn't wipe context mid-conversation. Intentionally separate
 * from persisted storage (user_preferences / safety_plans) — this is
 * short-lived working memory, not the "no full chat history stored" data.
 */

export type DetectedLanguage =
  | 'english'
  | 'roman_urdu'
  | 'roman_punjabi'
  | 'code_switched';

interface SessionState {
  history: ChatMessage[];
  detectedLanguage?: DetectedLanguage;
}

const sessions = new Map<string, SessionState>();

function getOrCreateSession(userId: string): SessionState {
  let session = sessions.get(userId);
  if (!session) {
    session = { history: [] };
    sessions.set(userId, session);
  }
  return session;
}

export function getHistory(userId: string): ChatMessage[] {
  return getOrCreateSession(userId).history;
}

export function getRecentAssistantMessages(userId: string, count = 3): string[] {
  const history = getOrCreateSession(userId).history;
  return history
    .filter((m) => m.role === 'assistant')
    .slice(-count)
    .map((m) => m.content);
}

export function appendTurn(
  userId: string,
  userMessage: string,
  assistantMessage: string
): void {
  const session = getOrCreateSession(userId);
  session.history.push({ role: 'user', content: userMessage });
  session.history.push({ role: 'assistant', content: assistantMessage });
}

export function getDetectedLanguage(userId: string): DetectedLanguage | undefined {
  return getOrCreateSession(userId).detectedLanguage;
}

export function setDetectedLanguage(userId: string, language: DetectedLanguage): void {
  getOrCreateSession(userId).detectedLanguage = language;
}

/** Clears server-side conversation memory for a "start a new chat" action. */
export function clearSession(userId: string): void {
  sessions.delete(userId);
}

export default {
  getHistory,
  getRecentAssistantMessages,
  appendTurn,
  getDetectedLanguage,
  setDetectedLanguage,
  clearSession,
};

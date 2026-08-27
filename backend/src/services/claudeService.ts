import env from '../config/env.js';
import buildSystemPrompt from '../config/systemPrompt.js';
import { buildPatternSection, type DetectedPattern } from './patternDetectionService.js';
import type { UserPreferences, ChatMessage } from '../types/index.js';
import type { DetectedLanguage } from './sessionService.js';
import { logger } from '../utils/logger.js';

const OPENROUTER_API_KEY = env.ANTHROPIC_API_KEY; // Using same env var for OpenRouter key
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Emitted by the model, on its own line, only when it naturally references a
// noticed pattern this turn. Stripped from the reply before it reaches the user;
// its presence is how chatController sets ChatResponse.messageType.
export const PATTERN_INSIGHT_MARKER = '[[pattern-insight]]';

export interface ClaudeServiceOptions {
  preferences?: UserPreferences;
  conversationHistory?: ChatMessage[];
  maxTokens?: number;
  comfortMode?: 'just_listen' | 'problem_solve' | 'distract' | 'guide';
  detectedLanguage?: DetectedLanguage;
  recentAssistantMessages?: string[];
  patterns?: DetectedPattern[];
}

/**
 * Send a message to OpenRouter API with the culturally-sensitive system prompt
 */
export async function sendMessage(
  userMessage: string,
  options: ClaudeServiceOptions = {}
): Promise<string> {
  const {
    preferences,
    conversationHistory = [],
    maxTokens = 1000,
    comfortMode,
    detectedLanguage,
    recentAssistantMessages,
    patterns,
  } = options;

  const systemPrompt = buildSystemPrompt(
    preferences,
    comfortMode,
    detectedLanguage,
    recentAssistantMessages
  );

  // Build conversation history. Pattern guidance is a separate system message
  // (rather than edited into the critical systemPrompt.ts) so it can be
  // gated on whether the user has any active patterns without touching that file.
  const messages = [
    { role: 'system', content: systemPrompt },
    ...(patterns && patterns.length > 0
      ? [{
          role: 'system',
          content: `${buildPatternSection(patterns)}\nIf you naturally reference one of these patterns in this reply, add "${PATTERN_INSIGHT_MARKER}" on its own line at the very end of your reply. Never mention this marker exists. Omit it entirely if you don't reference a pattern this turn.`,
        }]
      : []),
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    logger.debug(`Sending message to OpenRouter (${userMessage.length} chars)`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Umeed - Mental Health Companion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      logger.error('OpenRouter API error', errorData);
      throw new Error(`OpenRouter API error: ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as any;
    const assistantMessage = data?.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from OpenRouter API');
    }

    logger.debug(`Received response from OpenRouter (${assistantMessage.length} chars)`);
    return assistantMessage;
  } catch (error) {
    logger.error('Error calling OpenRouter API', error);
    throw error;
  }
}

/**
 * Get a quick safety resource suggestion
 */
export async function getSafetyResourceSuggestion(
  userMessage: string,
  preferences?: UserPreferences
): Promise<string> {
  const resourcePrompt = `The person has expressed distress and may need support. Based on their message, suggest 1-2 types of resources (crisis line, therapy, support group, etc.) that might be most helpful given their context. Be brief (1-2 sentences).`;

  return sendMessage(userMessage, {
    preferences,
    conversationHistory: [
      { role: 'assistant', content: resourcePrompt },
    ],
    maxTokens: 150,
  });
}

export default { sendMessage, getSafetyResourceSuggestion };

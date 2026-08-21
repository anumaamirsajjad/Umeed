import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env.js';
import buildSystemPrompt from '../config/systemPrompt.js';
import type { UserPreferences, ChatMessage } from '../types/index.js';
import { logger } from '../utils/logger.js';

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export interface ClaudeServiceOptions {
  preferences?: UserPreferences;
  conversationHistory?: ChatMessage[];
  maxTokens?: number;
}

/**
 * Send a message to Claude with the culturally-sensitive system prompt
 */
export async function sendMessage(
  userMessage: string,
  options: ClaudeServiceOptions = {}
): Promise<string> {
  const {
    preferences,
    conversationHistory = [],
    maxTokens = 1000,
  } = options;

  const systemPrompt = buildSystemPrompt(preferences);

  // Build conversation history for Claude
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    logger.debug(`Sending message to Claude (${userMessage.length} chars)`);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    if (response.content[0]?.type === 'text') {
      const assistantMessage = response.content[0].text;
      logger.debug(`Received response from Claude (${assistantMessage.length} chars)`);
      return assistantMessage;
    }

    throw new Error('Unexpected response format from Claude API');
  } catch (error) {
    logger.error('Error calling Claude API', error);
    throw error;
  }
}

/**
 * Get a quick safety resource suggestion from Claude
 * Used when crisis is detected to get context-aware resource suggestions
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

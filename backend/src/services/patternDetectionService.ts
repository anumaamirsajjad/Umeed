import { loadTable, saveTable } from '../db/jsonStore.js';
import { sendMessage } from './claudeService.js';
import type { UserPreferences, ChatMessage } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TABLE = 'user_patterns';
const MAX_ACTIVE_PATTERNS = 10;
const PATTERN_DECAY_MS = 14 * 24 * 60 * 60 * 1000; // 2 weeks

export interface DetectedPattern {
  id: string;
  userId: string;
  patternText: string;
  patternType: 'recurring_topic' | 'emotional_cycle' | 'coping_behavior';
  confidence: number; // 0-1
  evidence: string[]; // Examples from messages
  firstDetected: Date;
  lastMentioned: Date;
  frequency: number;
}

/**
 * Detect patterns in user messages using Claude
 * Only runs every 5+ messages to avoid spam
 */
export async function detectPatterns(
  userId: string,
  recentMessages: ChatMessage[]
): Promise<DetectedPattern[]> {
  try {
    // Only detect patterns every 5+ messages to avoid spam
    if (recentMessages.length % 5 !== 0) {
      return [];
    }

    logger.info(`Detecting patterns for user ${userId} (${recentMessages.length} messages)`);

    // Build conversation summary
    const messageSummary = recentMessages
      .slice(-20) // Last 20 messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n---\n');

    if (messageSummary.length === 0) {
      return [];
    }

    // Ask Claude to identify patterns
    const patternPrompt = `Analyze these messages from a user and identify 1-2 recurring patterns.

Messages:
${messageSummary}

Identify patterns that are:
- Genuine and evident (not forced)
- Helpful to understand the person
- Respectful and not judgmental

Return ONLY valid JSON (no markdown, no code blocks):
[
  {
    "pattern": "specific description of the pattern",
    "type": "recurring_topic" | "emotional_cycle" | "coping_behavior",
    "confidence": 0.85,
    "examples": ["exact quote from messages", "another exact quote"]
  }
]

If no clear patterns, return empty array: []`;

    const response = await sendMessage(patternPrompt, {
      conversationHistory: [],
      maxTokens: 300,
    });

    // Parse response carefully
    let patterns: any[] = [];
    try {
      // Extract JSON from response (remove markdown if present)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        patterns = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.warn(`Could not parse patterns from Claude response: ${response}`);
      return [];
    }

    // Validate and save patterns
    const savedPatterns: DetectedPattern[] = [];
    for (const pattern of patterns) {
      if (pattern.pattern && pattern.type && pattern.confidence) {
        const detectedPattern: DetectedPattern = {
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          patternText: pattern.pattern,
          patternType: pattern.type,
          confidence: pattern.confidence,
          evidence: pattern.examples || [],
          firstDetected: new Date(),
          lastMentioned: new Date(),
          frequency: 1,
        };

        savePattern(detectedPattern);
        savedPatterns.push(detectedPattern);

        logger.info(
          `Detected pattern: "${pattern.pattern}" (confidence: ${pattern.confidence})`
        );
      }
    }

    return savedPatterns;
  } catch (error) {
    logger.error('Error detecting patterns', error);
    return [];
  }
}

/**
 * Get active patterns for a user (within last 2 weeks)
 */
export function getActivePatterns(userId: string): DetectedPattern[] {
  try {
    const cutoff = Date.now() - PATTERN_DECAY_MS;
    const table = loadTable<DetectedPattern>(TABLE);

    const patterns = Object.values(table)
      .filter(p => p.userId === userId && new Date(p.lastMentioned).getTime() > cutoff)
      .sort((a, b) => new Date(b.lastMentioned).getTime() - new Date(a.lastMentioned).getTime())
      .slice(0, MAX_ACTIVE_PATTERNS);

    logger.debug(`Fetching active patterns for user ${userId}: found ${patterns.length}`);
    return patterns;
  } catch (error) {
    logger.error('Error fetching active patterns', error);
    return [];
  }
}

/**
 * Save a detected pattern
 */
function savePattern(pattern: DetectedPattern): void {
  try {
    const table = loadTable<DetectedPattern>(TABLE);

    // Dedupe: if this user already has a pattern with the same text, update
    // it in place instead of inserting a near-duplicate row.
    const existing = Object.values(table).find(
      p => p.userId === pattern.userId && p.patternText === pattern.patternText
    );

    if (existing) {
      logger.debug(`Updating existing pattern: ${pattern.patternText}`);
      existing.lastMentioned = pattern.lastMentioned;
      existing.frequency += 1;
      existing.confidence = pattern.confidence;
      existing.evidence = [...existing.evidence, ...pattern.evidence];
      table[existing.id] = existing;
    } else {
      logger.debug(`Saving pattern: ${pattern.patternText}`);
      table[pattern.id] = pattern;
    }

    saveTable(TABLE, table);
  } catch (error) {
    logger.error('Error saving pattern', error);
  }
}

/**
 * Clean up old patterns (older than 2 weeks)
 */
export function decayOldPatterns(userId: string): void {
  try {
    const cutoff = Date.now() - PATTERN_DECAY_MS;
    logger.debug(`Decaying old patterns for user ${userId}`);

    const table = loadTable<DetectedPattern>(TABLE);
    let changed = false;
    for (const [id, pattern] of Object.entries(table)) {
      if (pattern.userId === userId && new Date(pattern.lastMentioned).getTime() < cutoff) {
        delete table[id];
        changed = true;
      }
    }
    if (changed) {
      saveTable(TABLE, table);
    }
  } catch (error) {
    logger.error('Error decaying old patterns', error);
  }
}

/**
 * Build a system prompt section that references user's patterns
 * To be integrated into system prompt when patterns exist
 */
export function buildPatternSection(patterns: DetectedPattern[]): string {
  if (patterns.length === 0) {
    return '';
  }

  let section = '\nPATTERNS I\'VE NOTICED ABOUT THIS PERSON:\n';

  for (const pattern of patterns) {
    section += `- ${pattern.patternText} (confidence: ${Math.round(pattern.confidence * 100)}%)\n`;
  }

  section +=
    '\nWhen relevant, gently reference these patterns: "I\'ve noticed you mention X often..." Do not force references. Let patterns surface naturally in conversation.\n';

  return section;
}

export default {
  detectPatterns,
  getActivePatterns,
  savePattern,
  decayOldPatterns,
  buildPatternSection,
};

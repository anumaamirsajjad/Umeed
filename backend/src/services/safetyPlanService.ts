import { loadTable, saveTable } from '../db/jsonStore.js';
import { getActivePatterns } from './patternDetectionService.js';
import { sendMessage } from './claudeService.js';
import type { SafetyPlan, TrustedContact } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TABLE = 'safety_plans';

export async function saveSafetyPlan(
  userId: string,
  plan: Partial<Omit<SafetyPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<SafetyPlan> {
  const table = loadTable<SafetyPlan>(TABLE);
  const existing = table[userId];

  const safetyPlan: SafetyPlan = {
    id: existing?.id || `plan-${Date.now()}`,
    userId,
    warningSigns: plan.warningSigns ?? existing?.warningSigns ?? [],
    copingStrategies: plan.copingStrategies ?? existing?.copingStrategies ?? [],
    trustedContacts: plan.trustedContacts ?? existing?.trustedContacts ?? [],
    reasonsToStaySafe: plan.reasonsToStaySafe ?? existing?.reasonsToStaySafe ?? [],
    environmentSafetySteps: plan.environmentSafetySteps ?? existing?.environmentSafetySteps ?? [],
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  table[userId] = safetyPlan;
  saveTable(TABLE, table);

  logger.info(`Safety plan saved for user: ${userId}`);
  return safetyPlan;
}

export function getSafetyPlan(userId: string): SafetyPlan | null {
  const table = loadTable<SafetyPlan>(TABLE);
  return table[userId] || null;
}

export interface SafetyPlanDraft {
  warningSigns: string[];
  copingStrategies: string[];
  trustedContacts: Pick<TrustedContact, 'name' | 'relationship'>[];
  reasonsToStaySafe: string[];
  environmentSafetySteps: string[];
}

const EMPTY_DRAFT: SafetyPlanDraft = {
  warningSigns: [],
  copingStrategies: [],
  trustedContacts: [],
  reasonsToStaySafe: [],
  environmentSafetySteps: [],
};

/**
 * Suggest safety plan entries based on patterns learned from chat.
 * Returns an empty draft (not an error) if there isn't enough signal yet -
 * the user can always fill the form in manually.
 */
export async function generateSafetyPlanDraft(userId: string): Promise<SafetyPlanDraft> {
  const patterns = getActivePatterns(userId);

  if (patterns.length === 0) {
    logger.info(`No patterns available for safety plan suggestions: user=${userId}`);
    return EMPTY_DRAFT;
  }

  const prompt = `Based on what this person has shared over time, suggest gentle, specific draft entries for a personal safety plan.

Their observed patterns:
${patterns.map(p => `- ${p.patternText}`).join('\n')}

Return ONLY valid JSON (no markdown, no code blocks) in this exact shape:
{
  "warningSigns": ["specific sign grounded in their patterns"],
  "copingStrategies": ["specific strategy grounded in what they've mentioned"],
  "trustedContacts": [{"name": "leave blank for user to fill in", "relationship": "e.g. friend, sibling, mentor"}],
  "reasonsToStaySafe": ["specific reason grounded in what they value"],
  "environmentSafetySteps": ["specific thing to put out of reach, grounded in their patterns"]
}

Rules:
- Never invent names for trusted contacts - leave "name" as an empty string and only suggest the relationship type if evident.
- Each entry must be specific to this person, not generic advice like "practice deep breathing".
- If a section has no clear grounding in the patterns, return an empty array for it.
- Suggest at most 3 entries per section.`;

  try {
    const response = await sendMessage(prompt, { conversationHistory: [], maxTokens: 500 });
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.warn(`Could not find JSON in safety plan draft response: ${response}`);
      return EMPTY_DRAFT;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      warningSigns: Array.isArray(parsed.warningSigns) ? parsed.warningSigns : [],
      copingStrategies: Array.isArray(parsed.copingStrategies) ? parsed.copingStrategies : [],
      trustedContacts: Array.isArray(parsed.trustedContacts) ? parsed.trustedContacts : [],
      reasonsToStaySafe: Array.isArray(parsed.reasonsToStaySafe) ? parsed.reasonsToStaySafe : [],
      environmentSafetySteps: Array.isArray(parsed.environmentSafetySteps) ? parsed.environmentSafetySteps : [],
    };
  } catch (error) {
    logger.error('Error generating safety plan draft', error);
    return EMPTY_DRAFT;
  }
}

export default { saveSafetyPlan, getSafetyPlan, generateSafetyPlanDraft };

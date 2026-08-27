import { loadTable, saveTable } from '../db/jsonStore.js';
import type { UserPreferences } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TABLE = 'user_preferences';

/**
 * Save user preferences to file-backed storage
 */
export async function savePreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    logger.info(`Saving preferences for user: ${userId}`);

    const table = loadTable<UserPreferences>(TABLE);
    const existing = Object.values(table).find(p => p.userId === userId);

    const userPreferences: UserPreferences = {
      id: existing?.id || `pref-${Date.now()}`,
      userId,
      name: preferences.name !== undefined ? preferences.name : existing?.name,
      preferredSupportStyle: preferences.preferredSupportStyle || 'mixed',
      topicsToAvoid: preferences.topicsToAvoid || [],
      topicsOfConcern: preferences.topicsOfConcern || existing?.topicsOfConcern || [],
      languages: preferences.languages || ['en'],
      culturalContext: preferences.culturalContext,
      createdAt: existing?.createdAt || preferences.createdAt || new Date(),
      updatedAt: new Date(),
    };

    table[userPreferences.id] = userPreferences;
    saveTable(TABLE, table);

    logger.info(`Preferences saved for user: ${userId}`);
    return userPreferences;
  } catch (error) {
    logger.error('Error saving preferences', error);
    throw error;
  }
}

/**
 * Get user preferences from file-backed storage
 */
export async function getPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    logger.info(`Fetching preferences for user: ${userId}`);

    const table = loadTable<UserPreferences>(TABLE);
    const prefs = Object.values(table).find(p => p.userId === userId);

    if (!prefs) {
      logger.warn(`No preferences found for user: ${userId}`);
      return null;
    }

    return prefs;
  } catch (error) {
    logger.error('Error fetching preferences', error);
    throw error;
  }
}

export default { savePreferences, getPreferences };

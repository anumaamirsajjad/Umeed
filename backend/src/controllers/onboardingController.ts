import type { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { savePreferences, getPreferences } from '../services/preferencesService.js';
import type { OnboardingRequest } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * POST /onboarding/preferences
 * Save user preferences from onboarding flow
 * User ID comes from authenticated token
 */
export async function handleSavePreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {
      name,
      preferredSupportStyle,
      topicsToAvoid,
      topicsOfConcern,
      languages,
      culturalContext,
    } = req.body as OnboardingRequest;

    if (!preferredSupportStyle) {
      res.status(400).json({ error: 'preferredSupportStyle is required' });
      return;
    }

    logger.info(`Saving onboarding preferences for user: ${userId}`);

    const preferences = await savePreferences(userId, {
      userId,
      id: `pref-${Date.now()}`,
      name: name?.trim() || undefined,
      preferredSupportStyle,
      topicsToAvoid,
      topicsOfConcern,
      languages,
      culturalContext,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      userId,
      preferences,
    });
  } catch (error) {
    logger.error('Error saving preferences', error);
    res.status(500).json({
      error: 'Failed to save preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /onboarding/preferences
 * Retrieve authenticated user's preferences
 * User ID comes from authenticated token
 */
export async function handleGetPreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    logger.info(`Fetching preferences for user: ${userId}`);

    const preferences = await getPreferences(userId);

    if (!preferences) {
      res.status(404).json({
        error: 'Preferences not found',
        message: `No preferences found for user: ${userId}`,
      });
      return;
    }

    res.json(preferences);
  } catch (error) {
    logger.error('Error fetching preferences', error);
    res.status(500).json({
      error: 'Failed to fetch preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default { handleSavePreferences, handleGetPreferences };

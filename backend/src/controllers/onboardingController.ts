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

/**
 * GET /onboarding/status
 * Check if user has completed onboarding
 * Returns { completed: boolean }
 */
export async function handleGetOnboardingStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const preferences = await getPreferences(userId);
    const completed = preferences !== null;

    res.json({
      completed,
      preferences: preferences || null,
    });
  } catch (error) {
    logger.error('Error checking onboarding status', error);
    res.status(500).json({
      error: 'Failed to check onboarding status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * PUT /onboarding/preferences
 * Update existing user preferences
 */
export async function handleUpdatePreferences(req: AuthRequest, res: Response): Promise<void> {
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

    logger.info(`Updating preferences for user: ${userId}`);

    const existing = await getPreferences(userId);
    if (!existing) {
      res.status(404).json({ error: 'Preferences not found. Complete onboarding first.' });
      return;
    }

    const preferences = await savePreferences(userId, {
      userId,
      id: existing.id,
      name: name !== undefined ? name : existing.name,
      preferredSupportStyle: preferredSupportStyle || existing.preferredSupportStyle,
      topicsToAvoid: topicsToAvoid !== undefined ? topicsToAvoid : existing.topicsToAvoid,
      topicsOfConcern: topicsOfConcern !== undefined ? topicsOfConcern : existing.topicsOfConcern,
      languages: languages || existing.languages,
      culturalContext: culturalContext !== undefined ? culturalContext : existing.culturalContext,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    logger.error('Error updating preferences', error);
    res.status(500).json({
      error: 'Failed to update preferences',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default { handleSavePreferences, handleGetPreferences, handleGetOnboardingStatus, handleUpdatePreferences };

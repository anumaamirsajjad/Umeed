import type { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  saveSafetyPlan,
  getSafetyPlan,
  generateSafetyPlanDraft,
} from '../services/safetyPlanService.js';
import { generateSafetyPlanPDF } from '../services/pdfService.js';
import { logger } from '../utils/logger.js';

/**
 * POST /safety-plan
 * Create or update a user's safety plan
 * User ID comes from authenticated token
 */
export async function handleSaveSafetyPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { warningSigns, copingStrategies, trustedContacts, reasonsToStaySafe, environmentSafetySteps } = req.body;

    const plan = await saveSafetyPlan(userId, {
      warningSigns,
      copingStrategies,
      trustedContacts,
      reasonsToStaySafe,
      environmentSafetySteps,
    });

    res.json(plan);
  } catch (error) {
    logger.error('Error saving safety plan', error);
    res.status(500).json({
      error: 'Failed to save safety plan',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /safety-plan
 * Retrieve authenticated user's safety plan
 * User ID comes from authenticated token
 */
export async function handleGetSafetyPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const plan = getSafetyPlan(userId);

    if (!plan) {
      res.status(404).json({ error: 'No safety plan found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    logger.error('Error fetching safety plan', error);
    res.status(500).json({
      error: 'Failed to retrieve safety plan',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /safety-plan/suggestions
 * AI-suggested draft entries based on patterns learned from chat
 * User ID comes from authenticated token
 */
export async function handleGetSuggestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const draft = await generateSafetyPlanDraft(userId);
    res.json(draft);
  } catch (error) {
    logger.error('Error generating safety plan suggestions', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /safety-plan/export
 * Export the user's safety plan as a PDF
 * User ID comes from authenticated token
 */
export async function handleExportSafetyPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const plan = getSafetyPlan(userId);

    if (!plan) {
      res.status(404).json({ error: 'No safety plan found' });
      return;
    }

    const pdf = await generateSafetyPlanPDF(plan);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="safety-plan.pdf"');
    res.send(pdf);
  } catch (error) {
    logger.error('Error exporting safety plan', error);
    res.status(500).json({
      error: 'Failed to export safety plan',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default {
  handleSaveSafetyPlan,
  handleGetSafetyPlan,
  handleGetSuggestions,
  handleExportSafetyPlan,
};

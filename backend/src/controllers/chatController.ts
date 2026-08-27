import type { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { sendMessage, PATTERN_INSIGHT_MARKER } from '../services/claudeService.js';
import { detectCrisis } from '../services/crisisDetectionService.js';
import { classifyCrisisRisk } from '../services/crisisClassifierService.js';
import { detectPatterns, getActivePatterns, decayOldPatterns } from '../services/patternDetectionService.js';
import * as sessionService from '../services/sessionService.js';
import { detectLanguage } from '../services/languageDetectionService.js';
import { getTopCrisisResources } from '../services/resourcesService.js';
import type { ChatRequest, ChatResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Handle incoming chat messages
 * - Detects crisis language (server-side safety check)
 * - Calls Claude API
 * - Returns response with crisis alert if needed
 * User ID comes from authenticated token
 */
export async function handleChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { message, preferences, comfortMode } = req.body as ChatRequest;

    // Validate required fields
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    logger.info(`Chat request from user: ${userId}`);

    // CRITICAL: Detect crisis FIRST (server-side, independent of Claude)
    const crisisResult = detectCrisis(message);

    // Get user's active patterns (from last 2 weeks)
    const activePatterns = getActivePatterns(userId);
    logger.debug(`User has ${activePatterns.length} active patterns`);

    // Server-side session memory: full history for this user, in order
    const conversationHistory = sessionService.getHistory(userId);
    const recentAssistantMessages = sessionService.getRecentAssistantMessages(userId, 3);

    // Language/register detection: run on every message so we adapt to
    // mid-conversation switches, not just the first message
    const languageResult = detectLanguage(message);
    let detectedLanguage = sessionService.getDetectedLanguage(userId);
    if (!detectedLanguage || languageResult.confidence >= 0.5) {
      detectedLanguage = languageResult.label;
      sessionService.setDetectedLanguage(userId, detectedLanguage);
    }

    // Get Claude's reply AND the independent crisis classification IN PARALLEL —
    // the classifier never throws (it fails safe internally), so Promise.all
    // only rejects if the main chat call fails.
    let claudeResponse: string;
    let classification: Awaited<ReturnType<typeof classifyCrisisRisk>>;
    try {
      [claudeResponse, classification] = await Promise.all([
        sendMessage(message, {
          preferences: preferences ? {
            userId: userId,
            id: `pref-${userId}`,
            name: preferences.name,
            preferredSupportStyle: preferences.preferredSupportStyle || 'mixed',
            topicsToAvoid: preferences.topicsToAvoid || [],
            languages: preferences.languages || ['en'],
            culturalContext: preferences.culturalContext,
            createdAt: new Date(),
            updatedAt: new Date(),
          } : undefined,
          conversationHistory,
          recentAssistantMessages,
          detectedLanguage,
          comfortMode,
          patterns: activePatterns,
          maxTokens: 1000,
        }),
        classifyCrisisRisk(message),
      ]);
    } catch (error) {
      logger.error('Claude API error', error);
      res.status(500).json({
        error: 'Failed to get response from Claude',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return;
    }

    logger.debug(
      `Crisis signals for user ${userId}: regex=${crisisResult.isCrisis} classifier=${classification.riskLevel} (${classification.reasoning})`
    );

    // Detect and strip the pattern-insight marker (see claudeService) before this
    // reply is persisted to session history or sent to the user.
    const hasPatternInsight = claudeResponse.includes(PATTERN_INSIGHT_MARKER);
    if (hasPatternInsight) {
      claudeResponse = claudeResponse.replace(PATTERN_INSIGHT_MARKER, '').trimEnd();
    }

    // Combine both independent safety layers — either one flagging is enough to escalate
    const classifierEscalates = classification.riskLevel !== 'none';
    const isCrisis = crisisResult.isCrisis || classifierEscalates;
    const isAcute = classification.riskLevel === 'acute' || crisisResult.severity === 'critical';
    const severity: 'high' | 'critical' | undefined = isCrisis ? (isAcute ? 'critical' : 'high') : undefined;

    // Persist this turn into server-side session memory for future requests
    sessionService.appendTurn(userId, message, claudeResponse);

    // Detect new patterns (runs every 5+ messages to avoid spam)
    // This is async and non-blocking - we don't wait for it
    detectPatterns(userId, [{ role: 'user', content: message }])
      .then(newPatterns => {
        if (newPatterns.length > 0) {
          logger.info(`Detected ${newPatterns.length} new patterns for user ${userId}`);
        }
      })
      .catch(err => logger.error('Error detecting patterns', err));

    // Decay old patterns (older than 2 weeks)
    decayOldPatterns(userId);

    // Build response
    const response: ChatResponse = {
      id: `msg-${Date.now()}`,
      message: claudeResponse,
      isCrisis,
      ...(hasPatternInsight ? { messageType: 'pattern_insight' as const } : {}),
    };

    // If either safety layer flagged risk, add alert with resources —
    // "ambiguous" (classifier-only, ambiguous language) still escalates,
    // just with gentler framing than a confirmed/acute signal.
    if (isCrisis) {
      logger.warn(
        `CRISIS DETECTED from user ${userId}. severity=${severity} regex=${crisisResult.isCrisis} classifier=${classification.riskLevel}`
      );

      // Top crisis resources from the resource directory, prioritized by the
      // user's stated onboarding preferences (see resourcesService.matchForUser)
      const crisisHotlines = await getTopCrisisResources(userId, 3);

      const gentleFraming = !isAcute && !crisisResult.isCrisis; // classifier-only "ambiguous" signal

      response.crisisAlert = {
        triggered: true,
        severity: severity || 'high',
        message: gentleFraming
          ? 'It sounds like things might be really hard right now. These are here if you want them — no pressure.'
          : 'If you\'re in crisis, please reach out for help immediately.',
        resources: crisisHotlines,
      };
    }

    res.json(response);
  } catch (error) {
    logger.error('Unhandled error in chat controller', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /chat/new
 * Clears server-side conversation memory so the user can start a fresh chat.
 * User ID comes from authenticated token
 */
export async function handleNewChat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    sessionService.clearSession(userId);
    res.json({ success: true });
  } catch (error) {
    logger.error('Error clearing chat session', error);
    res.status(500).json({
      error: 'Failed to start new chat',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default { handleChat, handleNewChat };

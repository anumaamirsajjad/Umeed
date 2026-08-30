import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import { logger } from './utils/logger.js';
import { initializeDatabase } from './db/init.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import conversationsRoutes from './routes/conversations.js';
import onboardingRoutes from './routes/onboarding.js';
import resourcesRoutes from './routes/resources.js';
import safetyPlanRoutes from './routes/safety-plan.js';
import moodRoutes from './routes/mood.js';

const app = express();

// Initialize database on startup
try {
  initializeDatabase();
} catch (error) {
  logger.error('Failed to initialize database', error);
  process.exit(1);
}

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/resources', resourcesRoutes);
app.use('/safety-plan', safetyPlanRoutes);
app.use('/mood', moodRoutes);

// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.path} not found`,
  });
});

// Start server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});

export default app;

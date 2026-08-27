import 'dotenv/config';

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Crisis classifier — cheap/fast model, runs on every message in parallel with the main reply
  CRISIS_CLASSIFIER_MODEL: process.env.CRISIS_CLASSIFIER_MODEL || 'meta-llama/llama-3.1-8b-instruct',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:data/rescue.db',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Validation
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// Validate required env vars
if (!env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

export default env;

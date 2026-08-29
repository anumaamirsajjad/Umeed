import 'dotenv/config';

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // API Keys
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',

  // Auth token signing — no hardcoded fallback: a shared default committed to
  // source would let anyone forge a valid token for any account without a
  // password. See backend/src/tests/jwtSecret.test.ts.
  JWT_SECRET: process.env.JWT_SECRET || '',

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
if (!env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required (no default — a shared fallback would let anyone forge auth tokens). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

export default env;

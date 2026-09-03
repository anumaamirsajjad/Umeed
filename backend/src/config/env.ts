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

  // Crisis classifier — runs on every message in parallel with the main reply.
  // Needs to actually understand Roman Urdu/Punjabi idiom, not just English —
  // the 8B model previously here was flagging ordinary colloquial venting
  // (e.g. "sar phaar de mera nikama") as "ambiguous" on nearly every message.
  // meta-llama/llama-3.3-70b-instruct:free was pulled from OpenRouter's free tier next
  // (404 on every call) — since ANY classifier failure fails safe to "ambiguous", which
  // always escalates, that 404 silently turned every single message into a crisis alert.
  // Now points at the same model claudeService.ts already uses for the main chat reply,
  // since that's a live-verified-working free slug on this OpenRouter account. If this
  // gets deprecated too, check the classifier's fail-safe warnings in the logs (`Crisis
  // classifier fail-safe triggered: api_error_...`) — a spike means the model died, not
  // that every user suddenly did.
  CRISIS_CLASSIFIER_MODEL: process.env.CRISIS_CLASSIFIER_MODEL || 'minimax/minimax-m3:free',

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
if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET environment variable is required and must be at least 32 characters (no default — a shared or weak fallback would let anyone forge auth tokens). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

export default env;

import env from '../config/env.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = LOG_LEVELS[env.LOG_LEVEL as LogLevel] || LOG_LEVELS.info;

function formatTime(): string {
  return new Date().toISOString();
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= currentLogLevel;
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      console.log(`[${formatTime()}] DEBUG: ${message}`, data ?? '');
    }
  },

  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      console.log(`[${formatTime()}] INFO: ${message}`, data ?? '');
    }
  },

  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      console.warn(`[${formatTime()}] WARN: ${message}`, data ?? '');
    }
  },

  error: (message: string, error?: unknown) => {
    if (shouldLog('error')) {
      console.error(`[${formatTime()}] ERROR: ${message}`);
      if (error instanceof Error) {
        console.error(error.stack);
      } else {
        console.error(error);
      }
    }
  },
};

export default logger;

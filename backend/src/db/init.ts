import db from './connection.js';
import { SCHEMA_SQL } from './schema.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize database schema on startup
 * Creates all necessary tables if they don't exist
 */
export function initializeDatabase(): void {
  try {
    logger.info('Initializing database schema...');

    // Split SQL into individual statements and execute
    const statements = SCHEMA_SQL.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      db.exec(statement);
    }

    logger.info('✓ Database schema initialized successfully');

    // Verify tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];

    logger.info(`Database contains ${tables.length} tables:`, tables.map(t => t.name).join(', '));
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
}

export default { initializeDatabase };

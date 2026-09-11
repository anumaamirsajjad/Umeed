import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// On serverless/container platforms with a read-only filesystem (e.g. Cyclic's
// Lambda runtime), only /tmp is writable. Data still won't survive a cold start,
// but this at least lets writes succeed instead of throwing EROFS/EACCES.
const DATA_DIR = process.env.NODE_ENV === 'production'
  ? '/tmp/data'
  : path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Minimal file-backed key/value table store for MVP persistence.
 * Each table is a single JSON file: data/<table>.json, mapping id -> record.
 * Not concurrency-safe; fine for a single-process hackathon deployment.
 */
export function loadTable<T>(tableName: string): Record<string, T> {
  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    logger.warn(`Could not load table "${tableName}", starting fresh`, error);
  }
  return {};
}

export function saveTable<T>(tableName: string, data: Record<string, T>): void {
  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

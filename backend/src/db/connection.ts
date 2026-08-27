import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory database interface for development
interface Database {
  prepare: (sql: string) => {
    run: (...params: any[]) => any;
    get: (...params: any[]) => any;
    all: (...params: any[]) => any[];
  };
  exec: (sql: string) => void;
  close: () => void;
}

// Simple JSON-based storage for MVP (development only)
class SimpleDatabase implements Database {
  private tables: Record<string, any[]> = {};
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.tables = JSON.parse(data);
      }
    } catch (error) {
      logger.warn('Could not load database file, starting fresh');
      this.tables = {};
    }
  }

  private saveToFile(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tables, null, 2));
  }

  prepare(sql: string) {
    const self = this;
    return {
      run: (...params: any[]) => {
        logger.debug(`Executing: ${sql}`);
        self.saveToFile();
        return { changes: 1 };
      },
      get: (...params: any[]) => {
        logger.debug(`Querying: ${sql}`);
        return undefined;
      },
      all: (...params: any[]) => {
        logger.debug(`Querying all: ${sql}`);
        return [];
      },
    };
  }

  exec(sql: string): void {
    logger.debug(`Executing batch: ${sql.substring(0, 50)}...`);
    // For MVP, we'll skip schema creation as we're using JSON
  }

  close(): void {
    this.saveToFile();
  }
}

const db = new SimpleDatabase(DB_FILE);
logger.info(`Database initialized (MVP mode): ${DB_FILE}`);

export default db;

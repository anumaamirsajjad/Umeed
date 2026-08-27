import { loadTable, saveTable } from '../db/jsonStore.js';
import { logger } from '../utils/logger.js';

const TABLE = 'mood_checkins';

export interface MoodCheckin {
  id: string;
  userId: string;
  moodScore: number; // 1-5
  moodEmoji: string;
  timestamp: string; // ISO date string
}

export function saveMoodCheckin(
  userId: string,
  moodScore: number,
  moodEmoji: string
): MoodCheckin {
  const table = loadTable<MoodCheckin>(TABLE);

  const checkin: MoodCheckin = {
    id: `mood-${Date.now()}`,
    userId,
    moodScore,
    moodEmoji,
    timestamp: new Date().toISOString(),
  };

  table[checkin.id] = checkin;
  saveTable(TABLE, table);

  logger.info(`Mood checkin saved for user: ${userId} (score=${moodScore})`);
  return checkin;
}

export interface MoodTrendPoint {
  date: string; // YYYY-MM-DD
  mood: number;
  emoji: string;
}

export function getMoodTrend(userId: string, days: number): { data: MoodTrendPoint[]; average: number } {
  const table = loadTable<MoodCheckin>(TABLE);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const checkins = Object.values(table)
    .filter(c => c.userId === userId && new Date(c.timestamp).getTime() > cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const data: MoodTrendPoint[] = checkins.map(c => ({
    date: c.timestamp.slice(0, 10),
    mood: c.moodScore,
    emoji: c.moodEmoji,
  }));

  const average =
    data.length > 0 ? Number((data.reduce((sum, d) => sum + d.mood, 0) / data.length).toFixed(1)) : 0;

  return { data, average };
}

/**
 * Whether this user has already checked in today (used to show the modal at most once/day).
 */
export function hasCheckedInToday(userId: string): boolean {
  const table = loadTable<MoodCheckin>(TABLE);
  const today = new Date().toISOString().slice(0, 10);

  return Object.values(table).some(c => c.userId === userId && c.timestamp.slice(0, 10) === today);
}

export default { saveMoodCheckin, getMoodTrend, hasCheckedInToday };

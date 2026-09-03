import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPreferences } from './preferencesService.js';
import type { CrisisResource } from '../types/index.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESOURCES_FILE = path.join(__dirname, '../../../resources-db/resources.json');

let cachedResources: CrisisResource[] | null = null;

/**
 * Load the crisis/professional resource directory (single source of truth:
 * resources-db/resources.json). Cached in memory after first read.
 */
export function getAllResources(): CrisisResource[] {
  if (cachedResources) {
    return cachedResources;
  }

  try {
    const raw = fs.readFileSync(RESOURCES_FILE, 'utf-8');
    cachedResources = JSON.parse(raw) as CrisisResource[];
  } catch (error) {
    logger.error('Could not load resources-db/resources.json', error);
    cachedResources = [];
  }

  return cachedResources;
}

export function filterResources(options: { region?: string; type?: string }): CrisisResource[] {
  let resources = getAllResources();

  if (options.region) {
    resources = resources.filter(r => r.region === options.region || r.region === 'global');
  }
  if (options.type) {
    resources = resources.filter(r => r.type === options.type);
  }

  return resources;
}

export function searchResources(query: string): CrisisResource[] {
  const q = query.toLowerCase();
  return getAllResources().filter(
    r =>
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q)
  );
}

/**
 * Split resources into ones that match the user's stated preferences
 * ("matched") vs everything else ("other"). Matching is based ONLY on
 * explicit onboarding preferences (preferredSupportStyle, languages) —
 * never on inferred demographics, per project safety guardrails.
 */
export async function matchForUser(
  resources: CrisisResource[],
  userId?: string
): Promise<{ matched: CrisisResource[]; other: CrisisResource[] }> {
  if (!userId) {
    return { matched: [], other: resources };
  }

  const prefs = await getPreferences(userId);
  if (!prefs) {
    return { matched: [], other: resources };
  }

  const matched: CrisisResource[] = [];
  const other: CrisisResource[] = [];

  for (const resource of resources) {
    const contexts = resource.contexts || [];
    const supportStyleMatch = contexts.includes(prefs.preferredSupportStyle);
    const languageMatch = resource.languages.some(lang => prefs.languages.includes(lang));

    if (supportStyleMatch || languageMatch) {
      matched.push(resource);
    } else {
      other.push(resource);
    }
  }

  return { matched, other };
}

/**
 * Top crisis hotlines to surface in a crisis alert — user's preference
 * matches first, capped to `limit`.
 */
export async function getTopCrisisResources(
  userId: string | undefined,
  limit = 3
): Promise<CrisisResource[]> {
  const hotlines = getAllResources().filter(r => r.type === 'crisis_hotline');
  const { matched, other } = await matchForUser(hotlines, userId);
  return [...matched, ...other].slice(0, limit);
}

export default { getAllResources, filterResources, searchResources, matchForUser, getTopCrisisResources };

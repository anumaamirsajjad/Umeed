import type { Request, Response } from 'express';
import { filterResources, matchForUser, searchResources } from '../services/resourcesService.js';
import { logger } from '../utils/logger.js';

/**
 * GET /resources
 * Get crisis resources, optionally filtered by region or type, and split
 * into resources matching the user's stated preferences vs everything else.
 */
export async function handleGetResources(req: Request, res: Response): Promise<void> {
  try {
    const { region, type, city, userId } = req.query;

    logger.info(`Fetching resources: region=${region}, type=${type}, city=${city}, userId=${userId}`);

    const resources = filterResources({
      region: typeof region === 'string' ? region : undefined,
      type: typeof type === 'string' ? type : undefined,
      city: typeof city === 'string' ? city : undefined,
    });

    const response = await matchForUser(resources, typeof userId === 'string' ? userId : undefined);

    res.json(response);
  } catch (error) {
    logger.error('Error fetching resources', error);
    res.status(500).json({
      error: 'Failed to fetch resources',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * GET /resources/search
 * Search for resources by name, description, or country
 */
export async function handleSearchResources(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    logger.info(`Searching resources: q=${q}`);

    const results = searchResources(q);

    res.json(results);
  } catch (error) {
    logger.error('Error searching resources', error);
    res.status(500).json({
      error: 'Failed to search resources',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export default { handleGetResources, handleSearchResources };

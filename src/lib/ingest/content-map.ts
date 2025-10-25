/**
 * Content Map Utility
 * Generates navigation graph from canonical items
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import type Redis from 'ioredis';
import type { ContentMap, ContentSection, RawRecord } from './types';
import { logger } from '../logger';

/**
 * Generate content map from raw records
 * Groups records by type and creates hierarchical navigation
 *
 * @param records - Array of raw records from loaders
 * @returns ContentMap for navigation
 */
export function generateContentMap(records: RawRecord[]): ContentMap {
  const sections: ContentSection[] = [];

  // Group records by type
  const byType = new Map<string, RawRecord[]>();

  for (const record of records) {
    const existing = byType.get(record.type) || [];
    existing.push(record);
    byType.set(record.type, existing);
  }

  // Create sections for each type
  for (const [type, items] of byType) {
    const section = createSection(type, items);
    if (section) {
      sections.push(section);
    }
  }

  // Sort sections by priority
  sections.sort((a, b) => {
    const priority: Record<string, number> = {
      'page': 1,
      'faq': 2,
      'library': 3,
      'community': 4,
      'educator': 5,
      'organizer': 6,
    };

    const aPriority = priority[a.title.toLowerCase()] ?? 99;
    const bPriority = priority[b.title.toLowerCase()] ?? 99;

    return aPriority - bPriority;
  });

  return { sections };
}

/**
 * Create a content section from records of the same type
 */
function createSection(type: string, records: RawRecord[]): ContentSection | null {
  if (records.length === 0) {
    return null;
  }

  // Determine section title and base URL
  const sectionConfig: Record<string, { title: string; url: string }> = {
    'page': { title: 'Documentation', url: '/docs' },
    'faq': { title: 'FAQ', url: '/faq' },
    'library': { title: 'Tracked Libraries', url: '/libraries' },
    'community': { title: 'Communities', url: '/communities' },
    'educator': { title: 'Educators', url: '/educators' },
    'organizer': { title: 'Community Organizers', url: '/communities' },
  };

  const config = sectionConfig[type] || { title: type, url: `/${type}` };

  // Create child sections for each record
  const children: ContentSection[] = records.map(record => {
    const child: ContentSection = {
      title: record.title,
      url: record.url,
    };

    // Add anchors if available
    if (record.anchors && record.anchors.length > 0) {
      child.anchors = record.anchors;
    }

    return child;
  });

  // Sort children alphabetically
  children.sort((a, b) => a.title.localeCompare(b.title));

  return {
    title: config.title,
    url: config.url,
    children,
  };
}

/**
 * Store content map in Redis
 *
 * @param redis - Redis client
 * @param contentMap - Content map to store
 */
export async function storeContentMap(
  redis: Redis,
  contentMap: ContentMap
): Promise<void> {
  const key = 'rf:content-map';
  const json = JSON.stringify(contentMap, null, 2);

  await redis.set(key, json);

  logger.info(`[storeContentMap] Stored content map with ${contentMap.sections.length} sections`);
}

/**
 * Load content map from Redis
 *
 * @param redis - Redis client
 * @returns ContentMap or null if not found
 */
export async function loadContentMap(redis: Redis): Promise<ContentMap | null> {
  const key = 'rf:content-map';
  const json = await redis.get(key);

  if (!json) {
    return null;
  }

  try {
    const contentMap = JSON.parse(json) as ContentMap;
    return contentMap;
  } catch (error) {
    logger.error('[loadContentMap] Failed to parse content map:', error);
    return null;
  }
}

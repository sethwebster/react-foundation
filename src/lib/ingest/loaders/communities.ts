/**
 * Communities Loader
 * Loads React community data from Redis
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import type { ContentLoader, RawRecord } from '../types';
import { getRedisClient } from '@/lib/redis';
import { logger } from '@/lib/logger';

export class CommunitiesLoader implements ContentLoader {
  name = 'CommunitiesLoader';

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Loading communities from Redis`);

    const redis = getRedisClient();
    const records: RawRecord[] = [];

    try {
      // Get all community keys
      const keys = await redis.keys('community:*');
      logger.info(`[${this.name}] Found ${keys.length} communities in Redis`);

      for (const key of keys) {
        try {
          // Get community data
          const data = await redis.hgetall(key);

          if (!data || Object.keys(data).length === 0) {
            continue;
          }

          // Extract slug from key (community:slug)
          const slug = key.replace('community:', '');

          // Parse JSON fields and create typed community object
          const community: Record<string, unknown> = {
            ...data,
            organizers: data.organizers ? JSON.parse(data.organizers) : [],
            socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : {},
            eventFormats: data.eventFormats ? JSON.parse(data.eventFormats) : [],
            tags: data.tags ? JSON.parse(data.tags) : [],
          };

          // Build body text from community data
          const body = this.buildCommunityBody(community);

          // Create record
          const record: RawRecord = {
            id: `community-${slug}`,
            type: 'community',
            title: (community.name as string) || slug,
            url: `/communities/${slug}`,
            updatedAt: (community.updatedAt as string) || new Date().toISOString(),
            tags: {
              city: community.city as string,
              country: community.country as string,
              tier: community.coisTier as string,
              status: community.status as string,
              verified: community.verified as boolean,
              memberCount: community.memberCount as number,
            },
            body,
            anchors: [
              { text: 'About', anchor: '#about' },
              { text: 'Events', anchor: '#events' },
              { text: 'Organizers', anchor: '#organizers' },
              { text: 'Contact', anchor: '#contact' },
            ],
          };

          records.push(record);
        } catch (error) {
          logger.error(`[${this.name}] Failed to load community ${key}:`, error);
        }
      }

      logger.info(`[${this.name}] Loaded ${records.length} communities successfully`);
    } catch (error) {
      logger.error(`[${this.name}] Failed to load communities:`, error);
    }

    return records;
  }

  /**
   * Build searchable text body from community data
   */
  private buildCommunityBody(community: Record<string, unknown>): string {
    const parts: string[] = [];

    // Name and location
    parts.push(`# ${community.name}`);
    parts.push(`Location: ${community.city}, ${community.country}`);

    // Description
    if (community.description) {
      parts.push(`\n## About\n${community.description}`);
    }

    // Event details
    if (community.eventFormats && Array.isArray(community.eventFormats) && community.eventFormats.length > 0) {
      parts.push(`\n## Events\nEvent formats: ${community.eventFormats.join(', ')}`);
    }

    if (community.meetingFrequency) {
      parts.push(`Meeting frequency: ${community.meetingFrequency}`);
    }

    if (community.typicalAttendance) {
      parts.push(`Typical attendance: ${community.typicalAttendance} people`);
    }

    // Organizers
    if (community.organizers && Array.isArray(community.organizers) && community.organizers.length > 0) {
      parts.push(`\n## Organizers`);
      community.organizers.forEach((org: { name: string; role?: string }) => {
        parts.push(`- ${org.name}${org.role ? ` (${org.role})` : ''}`);
      });
    }

    // Contact
    if (community.website || community.socialLinks) {
      parts.push(`\n## Contact`);
      if (community.website) {
        parts.push(`Website: ${community.website}`);
      }
      if (community.socialLinks && typeof community.socialLinks === 'object') {
        const links = community.socialLinks as Record<string, string>;
        Object.entries(links).forEach(([platform, url]) => {
          parts.push(`${platform}: ${url}`);
        });
      }
    }

    // Tier/status
    if (community.coisTier) {
      parts.push(`\nCoIS Tier: ${community.coisTier}`);
    }

    if (community.verified) {
      parts.push(`Verified community`);
    }

    return parts.join('\n');
  }
}

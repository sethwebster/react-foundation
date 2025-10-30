/**
 * Communities Loader
 * Loads React community data from Redis
 * Based on AUTO_INGESTION_SETUP.md specification
 * 
 * Uses the new individual-key storage format for better scalability
 */

import type { ContentLoader, RawRecord } from '../types';
import type { Community } from '@/types/community';
import { getCommunities } from '@/lib/redis-communities';
import { logger } from '@/lib/logger';

export class CommunitiesLoader implements ContentLoader {
  name = 'CommunitiesLoader';

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Loading communities from Redis`);

    const records: RawRecord[] = [];

    try {
      // Use the new getCommunities() function which handles migration automatically
      const communities = await getCommunities();

      if (communities.length === 0) {
        logger.warn(`[${this.name}] No communities found in Redis`);
        return records;
      }

      logger.info(`[${this.name}] Found ${communities.length} communities in Redis`);

      for (const community of communities) {
        const communityName = community.name || 'unknown';
        try {
          // Extract slug - use slug field or generate from name
          const slug = community.slug ||
                       communityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

          // Build body text from community data
          const body = this.buildCommunityBody(community);

          // Create record
          const record: RawRecord = {
            id: `community-${slug}`,
            type: 'community',
            title: communityName,
            url: `/communities/${slug}`,
            updatedAt: community.updated_at || new Date().toISOString(),
            tags: {
              city: community.city,
              country: community.country,
              tier: community.cois_tier || '',
              status: community.status,
              verified: community.verified || false,
              memberCount: community.member_count || 0,
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
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`[${this.name}] Failed to load community ${communityName}: ${errorMsg}`);
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
   * Uses Community type with snake_case properties
   */
  private buildCommunityBody(community: import('@/types/community').Community): string {
    const parts: string[] = [];

    // Name and location
    parts.push(`# ${community.name}`);
    parts.push(`Location: ${community.city}, ${community.country}`);

    // Description
    if (community.description) {
      parts.push(`\n## About\n${community.description}`);
    }

    // Event details
    if (community.event_types && Array.isArray(community.event_types) && community.event_types.length > 0) {
      parts.push(`\n## Events\nEvent formats: ${community.event_types.join(', ')}`);
    }

    if (community.meeting_frequency) {
      parts.push(`Meeting frequency: ${community.meeting_frequency}`);
    }

    if (community.typical_attendance) {
      parts.push(`Typical attendance: ${community.typical_attendance} people`);
    }

    // Organizers
    if (community.organizers && Array.isArray(community.organizers) && community.organizers.length > 0) {
      parts.push(`\n## Organizers`);
      community.organizers.forEach((org) => {
        parts.push(`- ${org.name}${org.role ? ` (${org.role})` : ''}`);
      });
    }

    // Contact
    if (community.website || community.meetup_url || community.twitter_handle) {
      parts.push(`\n## Contact`);
      if (community.website) {
        parts.push(`Website: ${community.website}`);
      }
      if (community.meetup_url) {
        parts.push(`Meetup: ${community.meetup_url}`);
      }
      if (community.twitter_handle) {
        parts.push(`Twitter: ${community.twitter_handle}`);
      }
      if (community.discord_url) {
        parts.push(`Discord: ${community.discord_url}`);
      }
      if (community.slack_url) {
        parts.push(`Slack: ${community.slack_url}`);
      }
    }

    // Tier/status
    if (community.cois_tier) {
      parts.push(`\nCoIS Tier: ${community.cois_tier}`);
    }

    if (community.verified) {
      parts.push(`Verified community`);
    }

    return parts.join('\n');
  }
}

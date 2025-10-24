/**
 * Communities API Route
 * GET /api/communities - Fetch all React communities
 */

import { NextResponse } from 'next/server';
import { getCommunities } from '@/lib/redis-communities';
import { autoSeedCommunities } from '@/lib/auto-seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional filters
    const country = searchParams.get('country');
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const eventType = searchParams.get('eventType');

    // Fetch from Redis
    let communities = await getCommunities();

    // If no communities in Redis, auto-seed on first request
    if (communities.length === 0) {
      console.log('🌱 No communities found, triggering auto-seed...');
      await autoSeedCommunities();
      communities = await getCommunities();

      // If still empty, something is wrong
      if (communities.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Communities not seeded. Redis may be unavailable.',
          communities: [],
        });
      }
    }

    // Apply filters
    if (country) {
      communities = communities.filter((c) =>
        c.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (status) {
      communities = communities.filter((c) => c.status === status);
    }

    if (tier) {
      communities = communities.filter((c) => c.cois_tier === tier);
    }

    if (eventType) {
      communities = communities.filter((c) =>
        c.event_types.includes(eventType as any)
      );
    }

    return NextResponse.json({
      success: true,
      count: communities.length,
      communities,
    });
  } catch (error) {
    console.error('Error fetching communities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

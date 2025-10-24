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

    // Apply search filter
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      communities = communities.filter((c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.city.toLowerCase().includes(searchLower) ||
        c.country.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply country filter
    if (country) {
      communities = communities.filter((c) =>
        c.country.toLowerCase() === country.toLowerCase()
      );
    }

    // Apply status filter
    // 'all' = show all, 'active' (or no param) = show active only, others = specific status
    if (status === 'all') {
      // Show all, no filter
    } else if (status) {
      communities = communities.filter((c) => c.status === status);
    } else {
      // Default: show active only
      communities = communities.filter((c) => c.status === 'active');
    }

    // Apply tier filter
    if (tier) {
      communities = communities.filter((c) => c.cois_tier === tier);
    }

    // Apply event type filter (multiple types possible)
    const types = searchParams.get('types');
    if (types) {
      const typeList = types.split(',').filter(Boolean);
      if (typeList.length > 0) {
        communities = communities.filter((c) =>
          typeList.some(type => c.event_types.includes(type as any))
        );
      }
    }

    // Apply verified filter
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      communities = communities.filter((c) => c.verified);
    }

    // Apply upcoming events filter
    const upcoming = searchParams.get('upcoming');
    if (upcoming === 'true') {
      communities = communities.filter((c) => c.last_event_date);
    }

    // Apply sorting
    const sort = searchParams.get('sort') || 'members';
    switch (sort) {
      case 'members':
        communities.sort((a, b) => b.member_count - a.member_count);
        break;
      case 'activity':
        communities.sort((a, b) => {
          const aDate = a.last_event_date ? new Date(a.last_event_date).getTime() : 0;
          const bDate = b.last_event_date ? new Date(b.last_event_date).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'cois':
        communities.sort((a, b) => (b.cois_score || 0) - (a.cois_score || 0));
        break;
      case 'name':
        communities.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        communities.sort((a, b) => {
          const aDate = a.last_event_date ? new Date(a.last_event_date).getTime() : 0;
          const bDate = b.last_event_date ? new Date(b.last_event_date).getTime() : 0;
          return bDate - aDate;
        });
        break;
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

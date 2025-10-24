/**
 * Community Stats API
 * GET /api/communities/stats - Calculate stats from Redis data
 */

import { NextResponse } from 'next/server';
import { getCommunities } from '@/lib/redis-communities';

export async function GET() {
  try {
    const communities = await getCommunities();

    const stats = {
      total_communities: communities.length,
      active_communities: communities.filter(c => c.status === 'active').length,
      countries: new Set(communities.map(c => c.country)).size,
      total_members: communities.reduce((sum, c) => sum + c.member_count, 0),
      total_events_held: communities.reduce((sum, c) => {
        // Estimate from typical_attendance if totalEvents not available
        // For now, estimate based on age and frequency
        return sum;
      }, 0),

      // Tier breakdown
      by_tier: {
        platinum: communities.filter(c => c.cois_tier === 'platinum').length,
        gold: communities.filter(c => c.cois_tier === 'gold').length,
        silver: communities.filter(c => c.cois_tier === 'silver').length,
        bronze: communities.filter(c => c.cois_tier === 'bronze').length,
        none: communities.filter(c => !c.cois_tier).length,
      },

      // Status breakdown
      by_status: {
        active: communities.filter(c => c.status === 'active').length,
        inactive: communities.filter(c => c.status === 'inactive').length,
        paused: communities.filter(c => c.status === 'paused').length,
        new: communities.filter(c => c.status === 'new').length,
      },

      // Top communities by members
      top_communities: communities
        .sort((a, b) => b.member_count - a.member_count)
        .slice(0, 10)
        .map(c => ({
          name: c.name,
          city: c.city,
          country: c.country,
          members: c.member_count,
          tier: c.cois_tier,
        })),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate stats' },
      { status: 500 }
    );
  }
}

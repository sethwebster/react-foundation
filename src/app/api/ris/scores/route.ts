/**
 * RIS Scores Diagnostic API
 * Returns calculated scores for all libraries without re-running collection
 * Useful for debugging eligibility and allocation issues
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/lib/admin/user-management-service';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';
import { getCachedLibraryMetrics } from '@/lib/redis';
import { RISScoringService } from '@/lib/ris/scoring-service';
import type { LibraryRawMetrics } from '@/lib/ris/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication - require admin role
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = await UserManagementService.isAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 }
      );
    }

    // Collect cached metrics for all libraries
    const allMetrics: LibraryRawMetrics[] = [];
    const missing: string[] = [];

    for (const library of ecosystemLibraries) {
      const metrics = await getCachedLibraryMetrics(library.owner, library.name);
      if (metrics) {
        allMetrics.push(metrics);
      } else {
        missing.push(`${library.owner}/${library.name}`);
      }
    }

    if (allMetrics.length === 0) {
      return NextResponse.json({
        error: 'No cached metrics found',
        message: 'Run data collection first via POST /api/ris/collect',
        missing,
      });
    }

    // Calculate scores
    const scoringService = new RISScoringService();
    const scores = scoringService.calculateScores(allMetrics);

    // Sort by RIS descending
    const sortedScores = scores.sort((a, b) => b.ris - a.ris);

    // Calculate statistics
    const eligibilityThreshold = 0.15;
    const eligible = sortedScores.filter(s => s.ris >= eligibilityThreshold);
    const ineligible = sortedScores.filter(s => s.ris < eligibilityThreshold);

    return NextResponse.json({
      success: true,
      summary: {
        total: sortedScores.length,
        eligible: eligible.length,
        ineligible: ineligible.length,
        eligibilityThreshold,
        missing: missing.length,
        missingLibraries: missing,
        averageScore: sortedScores.reduce((sum, s) => sum + s.ris, 0) / sortedScores.length,
        medianScore: sortedScores[Math.floor(sortedScores.length / 2)]?.ris || 0,
      },
      scores: sortedScores.map(s => ({
        libraryName: s.libraryName,
        ris: s.ris,
        risPercent: (s.ris * 100).toFixed(2) + '%',
        eligible: s.ris >= eligibilityThreshold,
        components: {
          EF: s.ef,
          CQ: s.cq,
          MH: s.mh,
          CB: s.cb,
          MA: s.ma,
        },
        sponsorshipAdjustment: s.raw.sponsorship_adjustment,
      })),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Scores diagnostic error:', error);

    return NextResponse.json(
      {
        error: 'Failed to calculate scores',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

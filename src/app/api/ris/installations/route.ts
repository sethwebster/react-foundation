/**
 * Installation Status API
 * Returns which libraries have the GitHub App installed
 * and their current RIS scores
 */

import { NextResponse } from 'next/server';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';
import { getCachedLibraryMetrics } from '@/lib/redis';
import { getAllInstallations } from '@/lib/ris/webhook-queue';
import { logger } from '@/lib/logger';

export interface LibraryInstallationStatus {
  owner: string;
  name: string;
  category: string;
  tier: number;
  installed: boolean;
  installationId: number | null;
  score: number | null;
  lastUpdated: string | null;
  updateMethod: 'realtime' | 'monthly' | 'never';
}

export async function GET() {
  try {
    // Get all installations
    const installations = await getAllInstallations();

    // Build status for each library
    const libraries: LibraryInstallationStatus[] = await Promise.all(
      ecosystemLibraries.map(async (lib) => {
        const repoKey = `${lib.owner}/${lib.name}`;
        const isInstalled = installations.has(repoKey);
        const installationId = isInstalled ? installations.get(repoKey) || null : null;

        // Get cached metrics
        const metrics = await getCachedLibraryMetrics(lib.owner, lib.name);

        // Calculate score (0-100)
        const score = metrics ? calculateScore(metrics) : null;

        // Determine update method
        let updateMethod: 'realtime' | 'monthly' | 'never' = 'never';
        if (isInstalled) {
          updateMethod = 'realtime';
        } else if (metrics) {
          updateMethod = 'monthly';
        }

        return {
          owner: lib.owner,
          name: lib.name,
          category: lib.category,
          tier: lib.tier,
          installed: isInstalled,
          installationId,
          score,
          lastUpdated: metrics?.collected_at || null,
          updateMethod,
        };
      })
    );

    // Calculate summary stats
    const summary = {
      total: libraries.length,
      installed: libraries.filter(l => l.installed).length,
      withScores: libraries.filter(l => l.score !== null).length,
      realtimeUpdates: libraries.filter(l => l.updateMethod === 'realtime').length,
      monthlyUpdates: libraries.filter(l => l.updateMethod === 'monthly').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      libraries,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to fetch installation status:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch installation status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall RIS score from metrics (0-100)
 * This is a simplified score for display purposes
 */
function calculateScore(metrics: unknown): number {
  const metricsObj = metrics as Record<string, unknown>;

  // Component weights (from scoring-service.ts)
  const weights = {
    ecosystemFootprint: 0.30,
    contributionQuality: 0.25,
    maintainerHealth: 0.20,
    communityBenefit: 0.15,
    missionAlignment: 0.10,
  };

  // Get normalized component scores (already 0-1 from normalization)
  const ef = getNum(metricsObj, 'ef_normalized') || 0;
  const cq = getNum(metricsObj, 'cq_normalized') || 0;
  const mh = getNum(metricsObj, 'mh_normalized') || 0;
  const cb = getNum(metricsObj, 'cb_normalized') || 0;
  const ma = getNum(metricsObj, 'ma_normalized') || 0;

  // Calculate weighted score
  const score = (
    ef * weights.ecosystemFootprint +
    cq * weights.contributionQuality +
    mh * weights.maintainerHealth +
    cb * weights.communityBenefit +
    ma * weights.missionAlignment
  );

  // Convert to 0-100 scale
  return Math.round(score * 100);
}

function getNum(obj: Record<string, unknown>, key: string): number {
  const val = obj[key];
  return typeof val === 'number' ? val : 0;
}

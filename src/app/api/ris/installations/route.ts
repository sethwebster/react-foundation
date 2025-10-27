/**
 * Installation Status API
 * Returns which libraries have the GitHub App installed
 * and their current RIS scores and eligibility status
 */

import { NextResponse } from 'next/server';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';
import { getCachedLibraryMetrics, getCachedQuarterlyAllocation } from '@/lib/redis';
import { getAllInstallations } from '@/lib/ris/webhook-queue';
import { getLibraryEligibility } from '@/lib/admin/library-eligibility-service';
import { logger } from '@/lib/logger';
import type { EligibilityStatus } from '@/lib/ris/eligibility';

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
  eligibility?: {
    status: EligibilityStatus;
    adjustment: number;
  };
}

/**
 * Get current quarter string (e.g., "2025-Q4")
 */
function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

export async function GET() {
  try {
    // Get all installations
    const installations = await getAllInstallations();

    // Get current quarter allocation for scores
    const currentQuarter = getCurrentQuarter();
    const allocation = await getCachedQuarterlyAllocation(currentQuarter);

    // Create a map of library scores from allocation
    const scoreMap = new Map<string, number>();
    if (allocation) {
      for (const lib of allocation.libraries) {
        const key = `${lib.owner}/${lib.repo}`;
        // Convert RIS (0-1) to 0-100 scale
        scoreMap.set(key, Math.round(lib.ris * 100));
      }
    }

    // Build status for each library
    const libraries: LibraryInstallationStatus[] = await Promise.all(
      ecosystemLibraries.map(async (lib) => {
        const repoKey = `${lib.owner}/${lib.name}`;
        const isInstalled = installations.has(repoKey);
        const installationId = isInstalled ? installations.get(repoKey) || null : null;

        // Get cached metrics for last updated time
        const metrics = await getCachedLibraryMetrics(lib.owner, lib.name);

        // Get score from allocation
        const score = scoreMap.get(repoKey) || null;

        // Get eligibility status
        const eligibilityData = await getLibraryEligibility(lib.owner, lib.name);

        // Determine update method
        let updateMethod: 'realtime' | 'monthly' | 'never' = 'never';
        if (isInstalled) {
          updateMethod = 'realtime';
        } else if (metrics || score !== null) {
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
          eligibility: eligibilityData
            ? {
                status: eligibilityData.eligibility.status,
                adjustment: eligibilityData.eligibility.adjustment,
              }
            : undefined,
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

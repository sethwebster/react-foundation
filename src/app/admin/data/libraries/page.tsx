/**
 * Admin Data Libraries Page
 * Shows RIS data, library approval queue, and library list
 * Each section has its own Suspense boundary for independent streaming
 */

import { Suspense } from 'react';
import { getRedisClient, getCachedQuarterlyAllocation, getLastUpdated } from '@/lib/redis';
import { ecosystemLibraries } from '@/lib/maintainer-tiers';
import { getBulkLibraryEligibility } from '@/lib/admin/library-eligibility-service';
import { RISCollectionButton } from '../ris-collection-button';
import { LibraryApprovalQueue } from '@/components/admin/LibraryApprovalQueue';
import { LibraryList, type LibraryWithEligibility } from '@/components/admin/LibraryList';
import { LibraryListSkeleton } from '@/components/admin/LibraryListSkeleton';
import { RISDataSkeleton } from '@/components/admin/RISDataSkeleton';

export const dynamic = 'force-dynamic';

function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

/**
 * Main page - synchronous, renders immediately
 * Each section streams in independently via Suspense
 */
export default function LibrariesPage() {
  return (
    <div className="space-y-6">
      {/* Library Approval Queue - renders immediately (not async) */}
      <div className="bg-card border border-border rounded-xl p-6">
        <LibraryApprovalQueue />
      </div>

      {/* RIS Data - header and buttons always visible, data streams in */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">React Impact Score (RIS) Data</h3>

        {/* Collection Button - always available */}
        <div className="mb-6">
          <RISCollectionButton />
        </div>

        {/* Data section - streams in when ready */}
        <Suspense fallback={<RISDataSkeleton />}>
          <RISDataSection />
        </Suspense>
      </div>

      {/* All Libraries List - header always visible, data streams in */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          All Libraries ({ecosystemLibraries.length})
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          React ecosystem libraries tracked for RIS
        </p>

        {/* Data section - streams in when ready */}
        <Suspense fallback={<LibraryListSkeleton />}>
          <LibrariesListWithData />
        </Suspense>
      </div>
    </div>
  );
}

/**
 * Async component for RIS data section
 * Fetches RIS stats and collection status server-side
 */
async function RISDataSection() {
  const data = await getRISData();

  if (!data) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
        <p className="text-sm text-destructive">Unable to load RIS data. Check Redis connection.</p>
      </div>
    );
  }

  return (
    <>
      {/* Last updated timestamp */}
      {data.lastUpdated && (
        <div className="mb-4 text-sm text-muted-foreground text-right">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <InfoCard
          label="Libraries with Metrics"
          value={data.risMetricsKeys.toString()}
          detail={`Out of ${ecosystemLibraries.length} ecosystem libraries`}
          color={data.risMetricsKeys === ecosystemLibraries.length ? 'success' : 'primary'}
        />
        <InfoCard
          label="Libraries with Activity"
          value={data.risActivityKeys.toString()}
          detail="Permanent cached activity data"
          color={data.risActivityKeys === ecosystemLibraries.length ? 'success' : 'primary'}
        />
        <InfoCard
          label="Quarterly Allocations"
          value={data.keysByNamespace['ris:allocation'].toString()}
          detail="Cached allocation calculations"
        />
      </div>

      {/* Collection Status is now shown in RISCollectionButton component above, which polls for live updates */}
      {/* Removed duplicate server-side status display to avoid confusion with stale data */}

      {data.allocation && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            Current Quarter Allocation ({data.allocation.period})
          </h4>

          {/* Empty state warning when no libraries meet threshold */}
          {data.allocation.libraries.length === 0 && (
            <div className="mb-4 p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-warning-foreground font-semibold">
                ⚠️ No Libraries Meet Eligibility Threshold
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All libraries scored below the 15% RIS threshold. Check server logs for detailed score breakdown
                or use the diagnostic endpoint: <code className="text-xs bg-muted px-1 py-0.5 rounded">GET /api/ris/scores</code>
              </p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard
              label="Total Pool"
              value={`$${(data.allocation.total_pool_usd / 1000).toFixed(0)}K`}
              detail="Total allocation amount"
            />
            <InfoCard
              label="Libraries Scored"
              value={data.allocation.libraries.length.toString()}
              detail="Libraries in allocation"
            />
            <InfoCard
              label="Average Allocation"
              value={data.allocation.libraries.length > 0
                ? `$${Math.round(data.allocation.total_pool_usd / data.allocation.libraries.length / 1000)}K`
                : 'N/A'
              }
              detail={data.allocation.libraries.length > 0
                ? "Per library average"
                : "No libraries meet eligibility threshold"
              }
            />
            <InfoCard
              label="Top Library"
              value={data.allocation.libraries[0]?.libraryName || 'N/A'}
              detail={data.allocation.libraries[0] ? `$${Math.round(data.allocation.libraries[0].allocation_usd / 1000)}K` : ''}
            />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Fetch RIS data (separate from page load)
 */
async function getRISData() {
  try {
    const client = getRedisClient();

    const [
      risMetricsKeys,
      risActivityKeys,
      allKeys,
    ] = await Promise.all([
      client.keys('ris:metrics:*'),
      client.keys('ris:activity:*'),
      client.keys('*'),
    ]);

    const currentQuarter = getCurrentQuarter();

    const [allocation, lastUpdated] = await Promise.all([
      getCachedQuarterlyAllocation(currentQuarter).catch(() => null),
      getLastUpdated(),
      // Removed getCollectionStatus() - status is now fetched client-side for live updates
    ]);

    return {
      risMetricsKeys: risMetricsKeys.length,
      risActivityKeys: risActivityKeys.length,
      allocation,
      lastUpdated,
      // Removed collectionStatus - now shown in RISCollectionButton component
      keysByNamespace: {
        'ris:allocation': allKeys.filter(k => k.startsWith('ris:allocation:')).length,
      },
    };
  } catch (error) {
    console.error('Error fetching RIS data:', error);
    return null;
  }
}

/**
 * Async component that fetches library eligibility data server-side
 * Wrapped in Suspense boundary for streaming
 */
async function LibrariesListWithData() {
  // Fetch eligibility data for all libraries in parallel
  const librariesData = ecosystemLibraries.map(lib => ({
    owner: lib.owner,
    repo: lib.name,
  }));

  const [eligibilityData, allocation] = await Promise.all([
    getBulkLibraryEligibility(librariesData),
    getCachedQuarterlyAllocation(getCurrentQuarter()).catch(() => null),
  ]);

  // Create a map of RIS scores from allocation
  const risScoreMap = new Map<string, number>();
  if (allocation) {
    for (const lib of allocation.libraries) {
      const key = `${lib.owner}/${lib.repo}`;
      risScoreMap.set(key, lib.ris);
    }
  }

  // Merge library info with eligibility data and RIS scores
  const librariesWithEligibility: LibraryWithEligibility[] = ecosystemLibraries.map((lib, index) => {
    const eligibility = eligibilityData[index];
    const repoKey = `${lib.owner}/${lib.name}`;
    const risScore = risScoreMap.get(repoKey);

    return {
      owner: lib.owner,
      repo: lib.name,
      name: lib.name,
      github: `https://github.com/${lib.owner}/${lib.name}`,
      risScore,
      eligibility: eligibility
        ? {
            status: eligibility.eligibility.status,
            adjustment: eligibility.eligibility.adjustment,
          }
        : undefined,
    };
  });

  return <LibraryList libraries={librariesWithEligibility} showHeader={false} />;
}

function InfoCard({
  label,
  value,
  detail,
  color = 'primary',
}: {
  label: string;
  value: string;
  detail?: string;
  color?: 'primary' | 'success' | 'destructive';
}) {
  const colorClass = {
    primary: 'text-primary',
    success: 'text-success-foreground',
    destructive: 'text-destructive-foreground',
  }[color];

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorClass} mb-1`}>{value}</div>
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}

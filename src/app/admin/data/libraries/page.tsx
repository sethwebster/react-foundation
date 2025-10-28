/**
 * Admin Data Libraries Page
 * Shows RIS data, library approval queue, and library list
 * Each section has its own Suspense boundary for independent streaming
 */

import { Suspense } from 'react';
import { getRedisClient, getCachedQuarterlyAllocation, getLastUpdated, getCollectionStatus } from '@/lib/redis';
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

      {data.collectionStatus && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">Collection Status</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                (data.collectionStatus.status as string) === 'completed'
                  ? 'bg-success/20 text-success-foreground'
                  : (data.collectionStatus.status as string) === 'running'
                  ? 'bg-primary/20 text-primary-foreground'
                  : (data.collectionStatus.status as string) === 'failed'
                  ? 'bg-destructive/20 text-destructive-foreground'
                  : 'bg-muted-foreground/20 text-muted-foreground'
              }`}
            >
              {String(data.collectionStatus.status || 'unknown')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {String(data.collectionStatus.message || 'No status message')}
          </p>
          {data.collectionStatus.progress !== undefined &&
           data.collectionStatus.total !== undefined &&
           (data.collectionStatus.total as number) > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted-foreground/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((data.collectionStatus.progress as number) / (data.collectionStatus.total as number)) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {String(data.collectionStatus.progress)}/{String(data.collectionStatus.total)}
              </span>
            </div>
          )}
        </div>
      )}

      {data.allocation && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">
            Current Quarter Allocation ({data.allocation.period})
          </h4>

          {/* Enhanced diagnostic when libraries are below threshold */}
          {data.allocation.libraries.length > 0 &&
           data.allocation.libraries.filter(lib => lib.allocation_usd > 0).length === 0 && (
            <div className="mb-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-sm text-warning-foreground font-semibold">
                ⚠️ No Libraries Meet Eligibility Threshold (15%)
              </p>
              <p className="text-sm text-muted-foreground mt-2 mb-3">
                All {data.allocation.libraries.length} libraries scored below the 15% RIS threshold and received $0 allocation.
              </p>

              {/* Score Distribution */}
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold text-foreground mb-2">Score Distribution:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Highest:</span>{' '}
                    <span className="font-mono text-foreground">
                      {(data.allocation.libraries[0]?.ris * 100).toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground ml-1">
                      ({data.allocation.libraries[0]?.libraryName})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lowest:</span>{' '}
                    <span className="font-mono text-foreground">
                      {(data.allocation.libraries[data.allocation.libraries.length - 1]?.ris * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average:</span>{' '}
                    <span className="font-mono text-foreground">
                      {(data.allocation.libraries.reduce((sum, lib) => sum + lib.ris, 0) / data.allocation.libraries.length * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Median:</span>{' '}
                    <span className="font-mono text-foreground">
                      {(data.allocation.libraries[Math.floor(data.allocation.libraries.length / 2)]?.ris * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Top 5 Scores */}
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold text-foreground mb-2">Top 5 Libraries:</p>
                <div className="space-y-1">
                  {data.allocation.libraries.slice(0, 5).map((lib, idx) => (
                    <div key={lib.libraryName} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {idx + 1}. {lib.libraryName}
                      </span>
                      <span className="font-mono text-foreground">
                        {(lib.ris * 100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Actions */}
              <div className="mt-3 pt-3 border-t border-warning/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Possible causes:</strong> Missing metrics, low activity data, or data collection issues.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Next steps:</strong> Use the diagnostic endpoint for detailed component scores:{' '}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">GET /api/ris/scores</code>
                </p>
              </div>
            </div>
          )}

          {/* Original warning for truly empty allocation */}
          {data.allocation.libraries.length === 0 && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive-foreground font-semibold">
                ❌ No Allocation Data Available
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No libraries found in allocation. This indicates a data collection failure.
                Try running the data collection again.
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

    const [allocation, lastUpdated, collectionStatus] = await Promise.all([
      getCachedQuarterlyAllocation(currentQuarter).catch(() => null),
      getLastUpdated(),
      getCollectionStatus(),
    ]);

    return {
      risMetricsKeys: risMetricsKeys.length,
      risActivityKeys: risActivityKeys.length,
      allocation,
      lastUpdated,
      collectionStatus,
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

  const eligibilityData = await getBulkLibraryEligibility(librariesData);

  // Merge library info with eligibility data
  const librariesWithEligibility: LibraryWithEligibility[] = ecosystemLibraries.map((lib, index) => {
    const eligibility = eligibilityData[index];

    return {
      owner: lib.owner,
      repo: lib.name,
      name: lib.name,
      github: `https://github.com/${lib.owner}/${lib.name}`,
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

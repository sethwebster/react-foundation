/**
 * Library Impact Dashboard
 * Shows React ecosystem libraries with their RIS scores and allocations
 */

'use client';

import {
  useRISAllocationFromAPI,
  useSampleRISData,
  useComponentStats,
  useCollectionStatus,
} from '@/lib/ris';
import { RISLibraryRankings } from '@/components/ris/ris-library-rankings';
import { RFDS } from '@/components/rfds';
import Link from 'next/link';

export default function LibrariesPage() {
  // Try to fetch real data from API
  const { allocation: realAllocation, isLoading, isError } = useRISAllocationFromAPI();
  const { lastUpdated, currentQuarter } = useCollectionStatus();

  // Fall back to sample data if real data not available
  const useSampleData = isError || !realAllocation;
  const sampleAllocation = useSampleRISData(1_000_000, '2025-Q4');
  const allocation = useSampleData ? sampleAllocation : realAllocation;

  const componentStats = useComponentStats(allocation.libraries);

  const totalLibraries = allocation.libraries.length;
  const avgRIS = allocation.libraries.reduce((sum, lib) => sum + lib.ris, 0) / totalLibraries;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/scoring"
              className="rounded-lg bg-background/5 px-3 py-1.5 text-sm text-foreground/70 transition hover:bg-background/10 hover:text-foreground"
            >
              ← How Scoring Works
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Library Impact Dashboard
          </h1>
          <p className="mt-4 text-xl text-foreground/70">
            React ecosystem libraries ranked by their impact score
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Libraries"
            value={totalLibraries.toString()}
            subtext="Tracked in ecosystem"
          />
          <StatCard
            label="Funding Pool"
            value={`$${(allocation.total_pool_usd / 1_000_000).toFixed(1)}M`}
            subtext="Quarterly allocation"
          />
          <StatCard
            label="Average RIS"
            value={`${(avgRIS * 100).toFixed(1)}%`}
            subtext="Mean impact score"
            highlight
          />
          <StatCard
            label="Period"
            value={allocation.period}
            subtext="Current quarter"
          />
        </div>

        {/* Component Stats */}
        <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Component Score Averages
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {componentStats.map((stat) => (
              <div key={stat.component}>
                <div className="mb-2 text-sm text-foreground/60">{stat.label}</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {(stat.avg * 100).toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-foreground/50">
                  Range: {(stat.min * 100).toFixed(0)}% - {(stat.max * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-xl border border-border/10 bg-background/[0.03] p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-foreground/60">Loading RIS data...</p>
          </div>
        )}

        {/* Data Source Banner */}
        {!isLoading && (
          <div className={`rounded-xl border p-6 ${
            useSampleData
              ? 'border-warning/30 bg-warning/10'
              : 'border-success/30 bg-success/10'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{useSampleData ? '⚠️' : '✓'}</span>
              <div className="space-y-2 text-sm text-foreground/80">
                {useSampleData ? (
                  <>
                    <p className="font-semibold text-foreground">Using Sample Data</p>
                    <p>
                      Real RIS data not yet available. This dashboard shows sample data demonstrating
                      how the React Impact Score (RIS) system evaluates libraries across 5 key components.
                    </p>
                    <p>
                      To use real data, configure your GitHub PAT and Redis URL, then run data collection
                      via <code className="rounded bg-background/10 px-1">POST /api/ris/collect</code>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-foreground">Using Real Data</p>
                    <p>
                      This dashboard displays actual metrics collected from GitHub, NPM, CDN providers,
                      and OSSF Scorecard for {allocation.libraries.length} React ecosystem libraries.
                    </p>
                    {lastUpdated && (
                      <p className="text-xs text-foreground/60">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </>
                )}
                <p>
                  <Link href="/scoring" className="font-medium text-cyan-300 hover:text-cyan-200">
                    Learn more about how scoring works →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Library Rankings */}
        <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Library Rankings
            </h2>
            <div className="text-sm text-foreground/60">
              {totalLibraries} libraries · Total pool: ${allocation.total_pool_usd.toLocaleString()}
            </div>
          </div>
          <RISLibraryRankings
            libraries={allocation.libraries}
            showAllocation={true}
            highlightTop={3}
          />
        </div>

        {/* Methodology Note */}
        <div className="rounded-xl border border-border/10 bg-background/[0.03] p-6 text-center">
          <p className="text-sm text-foreground/60">
            Scores are calculated using winsorized normalization to reduce outlier impact,
            with EMA smoothing for quarter-to-quarter stability.
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            All data is transparent and reproducible. See the{' '}
            <Link href="/scoring" className="text-cyan-400 hover:text-cyan-300">
              scoring documentation
            </Link>{' '}
            for full methodology.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <RFDS.StatCard
      label={label}
      value={value}
      detail={subtext}
      highlight={highlight}
      color="primary"
      variant="outlined"
    />
  );
}

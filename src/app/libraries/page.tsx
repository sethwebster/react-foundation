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
import { Panel, PanelButton, PanelEyebrow, PanelPlainLink, PanelSub, RowList } from '@/components/panels/panel';
import { PanelsFooter } from '@/components/panels/panels-footer';
import Link from 'next/link';

export default function LibrariesPage() {
  // Try to fetch real data from API
  const { allocation: realAllocation, isLoading, isError } = useRISAllocationFromAPI();
  const { lastUpdated } = useCollectionStatus();

  // Fall back to sample data if real data not available
  const useSampleData = isError || !realAllocation;
  const sampleAllocation = useSampleRISData(1_000_000, '2025-Q4');
  const allocation = useSampleData ? sampleAllocation : realAllocation;

  const componentStats = useComponentStats(allocation.libraries);

  const totalLibraries = allocation.libraries.length;
  const avgRIS = allocation.libraries.reduce((sum, lib) => sum + lib.ris, 0) / totalLibraries;

  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="libraries-hero-title" className="flex min-h-[48vh] flex-col">
        <div className="relative z-[1] mt-auto pt-16 md:pt-[88px]">
          <PanelEyebrow as="p">Library impact dashboard</PanelEyebrow>
          <h1
            id="libraries-hero-title"
            className="mt-4 max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
          >
            Library Impact Dashboard
          </h1>
          <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
            React ecosystem libraries ranked by their impact score.
          </p>
          <div className="mt-6">
            <PanelPlainLink href="/scoring">How Scoring Works</PanelPlainLink>
          </div>
        </div>
      </Panel>

      <Panel tone="paper" compact labelledBy="libraries-summary-title">
        <PanelEyebrow id="libraries-summary-title">By the numbers</PanelEyebrow>
        <RowList className="mt-3">
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
        </RowList>
      </Panel>

      <Panel tone="paper" labelledBy="component-averages-title">
        <PanelEyebrow id="component-averages-title">Component score averages</PanelEyebrow>
        <PanelSub>Average RIS components across the currently loaded library set.</PanelSub>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-2 lg:grid-cols-5">
          {componentStats.map((stat) => (
            <div key={stat.component} className="bg-white p-5">
              <div className="text-sm font-medium text-[#5E687E]">{stat.label}</div>
              <div className="mt-3 font-mono-panels text-2xl font-medium text-[#087EA4]">
                {(stat.avg * 100).toFixed(1)}%
              </div>
              <div className="mt-1 text-xs text-[#5E687E]">
                Range: {(stat.min * 100).toFixed(0)}% - {(stat.max * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {isLoading && (
        <Panel tone="paper" labelledBy="libraries-loading-title">
          <div className="p-6 text-center">
            <PanelEyebrow id="libraries-loading-title">Loading data</PanelEyebrow>
            <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-[#087EA4] border-t-transparent"></div>
            <p className="mt-4 text-[#5E687E]">Loading RIS data...</p>
          </div>
        </Panel>
      )}

      {!isLoading && (
        <Panel tone="paper" labelledBy="data-source-title">
          <div className={`rounded-2xl border p-6 ${
            useSampleData
              ? 'border-[#F7C948] bg-[#FFF8DB]'
              : 'border-[#2F9E44] bg-[#E9F8EF]'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{useSampleData ? '⚠️' : '✓'}</span>
              <div className="space-y-2 text-sm text-[#23272F]">
                {useSampleData ? (
                  <>
                    <p id="data-source-title" className="font-semibold text-[#16181D]">Using Sample Data</p>
                    <p>
                      Real RIS data not yet available. This dashboard shows sample data demonstrating
                      how the React Impact Score (RIS) system evaluates libraries across 5 key components.
                    </p>
                    <p>
                      To use real data, configure your GitHub PAT and Redis URL, then run data collection
                      via <code className="rounded bg-white/70 px-1">POST /api/ris/collect</code>
                    </p>
                  </>
                ) : (
                  <>
                    <p id="data-source-title" className="font-semibold text-[#16181D]">Using Real Data</p>
                    <p>
                      This dashboard displays actual metrics collected from GitHub, NPM, CDN providers,
                      and OSSF Scorecard for {allocation.libraries.length} React ecosystem libraries.
                    </p>
                    {lastUpdated && (
                      <p className="text-xs text-[#5E687E]">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </>
                )}
                <p>
                  <Link href="/scoring" className="font-medium text-[#087EA4] hover:text-[#056078]">
                    Learn more about how scoring works →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Panel>
      )}

      <Panel tone="paper" labelledBy="library-rankings-title">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <PanelEyebrow id="library-rankings-title">Library rankings</PanelEyebrow>
            <PanelSub>Scores and allocation estimates for the current RIS period.</PanelSub>
          </div>
          <div className="font-mono-panels text-sm text-[#5E687E]">
            {totalLibraries} libraries · Total pool: ${allocation.total_pool_usd.toLocaleString()}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#EBECF0] bg-white p-4">
          <RISLibraryRankings
            libraries={allocation.libraries}
            showAllocation={true}
            highlightTop={3}
          />
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="methodology-note-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <PanelEyebrow id="methodology-note-title">Methodology</PanelEyebrow>
            <p className="mt-4 max-w-[48rem] text-[17px] leading-[1.55] text-[#5E687E]">
              Scores are calculated using winsorized normalization to reduce outlier impact,
              with EMA smoothing for quarter-to-quarter stability.
            </p>
            <p className="mt-2 max-w-[48rem] text-[17px] leading-[1.55] text-[#5E687E]">
              All data is transparent and reproducible. See the scoring documentation for full methodology.
            </p>
          </div>
          <PanelButton href="/scoring" variant="ink">
            View scoring docs
          </PanelButton>
        </div>
      </Panel>

      <PanelsFooter />
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
    <div className="grid gap-x-5 gap-y-2 py-[18px] text-[#16181D] md:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <h3 className="text-[17px] font-medium">{label}</h3>
        <p className="mt-1 text-sm text-[#5E687E]">{subtext}</p>
      </div>
      <div className={highlight ? "font-mono-panels text-[15px] font-medium text-[#087EA4]" : "font-mono-panels text-[15px] font-medium text-[#16181D]"}>
        {value}
      </div>
    </div>
  );
}

/**
 * React Impact Score (RIS) - Custom Hooks
 * Provides hooks for using RIS calculations in React components
 */

'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { RISScoringService } from './scoring-service';
import type {
  LibraryRawMetrics,
  LibraryScore,
  QuarterlyAllocation,
  RISConfig,
} from './types';
import { SAMPLE_RAW_METRICS } from './mock-data';

/**
 * SWR fetcher function
 */
const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

/**
 * Hook to calculate RIS scores from raw metrics
 *
 * @param rawMetrics - Array of raw library metrics
 * @param previousScores - Optional map of previous quarter scores for smoothing
 * @param config - Optional RIS configuration overrides
 * @returns Calculated library scores
 */
export function useRISScores(
  rawMetrics: LibraryRawMetrics[],
  previousScores?: Map<string, number>,
  config?: Partial<RISConfig>
): LibraryScore[] {
  return useMemo(() => {
    const service = new RISScoringService(config);
    return service.calculateScores(rawMetrics, previousScores);
  }, [rawMetrics, previousScores, config]);
}

/**
 * Hook to calculate quarterly allocation with revenue distribution
 *
 * @param rawMetrics - Array of raw library metrics
 * @param totalPoolUsd - Total funding pool in USD
 * @param period - Quarter period (e.g., "2025-Q4")
 * @param previousScores - Optional previous quarter scores
 * @param config - Optional RIS configuration
 * @returns Complete quarterly allocation
 */
export function useQuarterlyAllocation(
  rawMetrics: LibraryRawMetrics[],
  totalPoolUsd: number,
  period: string,
  previousScores?: Map<string, number>,
  config?: Partial<RISConfig>
): QuarterlyAllocation {
  return useMemo(() => {
    const service = new RISScoringService(config);
    return service.generateQuarterlyAllocation(
      rawMetrics,
      totalPoolUsd,
      period,
      previousScores
    );
  }, [rawMetrics, totalPoolUsd, period, previousScores, config]);
}

/**
 * Hook to get a single library's score from the cohort
 *
 * @param libraryName - Name of the library to find
 * @param scores - Array of all library scores
 * @returns Single library score or undefined
 */
export function useLibraryScore(
  libraryName: string,
  scores: LibraryScore[]
): LibraryScore | undefined {
  return useMemo(() => {
    return scores.find((s) => s.libraryName === libraryName);
  }, [libraryName, scores]);
}

/**
 * Hook to sort and rank libraries by RIS score
 *
 * @param scores - Array of library scores
 * @param descending - Sort descending (default: true)
 * @returns Sorted scores with rankings
 */
export function useRISRankings(
  scores: LibraryScore[],
  descending: boolean = true
): Array<LibraryScore & { rank: number }> {
  return useMemo(() => {
    const sorted = [...scores].sort((a, b) =>
      descending ? b.ris - a.ris : a.ris - b.ris
    );
    return sorted.map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
  }, [scores, descending]);
}

/**
 * Hook to filter libraries by minimum RIS threshold
 *
 * @param scores - Array of library scores
 * @param minRIS - Minimum RIS threshold (0-1)
 * @returns Filtered scores
 */
export function useRISFiltered(
  scores: LibraryScore[],
  minRIS: number
): LibraryScore[] {
  return useMemo(() => {
    return scores.filter((s) => s.ris >= minRIS);
  }, [scores, minRIS]);
}

/**
 * Hook to group libraries by category with aggregate stats
 * Requires libraries to have category metadata
 */
export interface CategoryStats {
  category: string;
  libraries: LibraryScore[];
  avgRIS: number;
  totalAllocation: number;
  count: number;
}

export function useRISByCategory(
  scores: LibraryScore[],
  categoryMap: Map<string, string> // libraryName -> category
): CategoryStats[] {
  return useMemo(() => {
    const grouped = new Map<string, LibraryScore[]>();

    scores.forEach((score) => {
      const category = categoryMap.get(score.libraryName) || 'other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(score);
    });

    return Array.from(grouped.entries()).map(([category, libs]) => ({
      category,
      libraries: libs,
      avgRIS: libs.reduce((sum, lib) => sum + lib.ris, 0) / libs.length,
      totalAllocation: libs.reduce((sum, lib) => sum + lib.allocation_usd, 0),
      count: libs.length,
    }));
  }, [scores, categoryMap]);
}

/**
 * Hook to calculate component score statistics across all libraries
 */
export interface ComponentStats {
  component: 'EF' | 'CQ' | 'MH' | 'CB' | 'MA';
  label: string;
  avg: number;
  min: number;
  max: number;
  median: number;
}

export function useComponentStats(scores: LibraryScore[]): ComponentStats[] {
  return useMemo(() => {
    if (scores.length === 0) return [];

    const components: Array<{
      key: 'ef' | 'cq' | 'mh' | 'cb' | 'ma';
      component: 'EF' | 'CQ' | 'MH' | 'CB' | 'MA';
      label: string;
    }> = [
      { key: 'ef', component: 'EF', label: 'Ecosystem Footprint' },
      { key: 'cq', component: 'CQ', label: 'Contribution Quality' },
      { key: 'mh', component: 'MH', label: 'Maintainer Health' },
      { key: 'cb', component: 'CB', label: 'Community Benefit' },
      { key: 'ma', component: 'MA', label: 'Mission Alignment' },
    ];

    return components.map(({ key, component, label }) => {
      const values = scores.map((s) => s[key]).sort((a, b) => a - b);
      return {
        component,
        label,
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        min: values[0],
        max: values[values.length - 1],
        median: values[Math.floor(values.length / 2)],
      };
    });
  }, [scores]);
}

/**
 * Hook to use sample/mock data for development and testing
 *
 * @param totalPoolUsd - Total funding pool
 * @param period - Quarter period
 * @returns Sample quarterly allocation
 */
export function useSampleRISData(
  totalPoolUsd: number = 1_000_000,
  period: string = '2025-Q4'
): QuarterlyAllocation {
  return useQuarterlyAllocation(SAMPLE_RAW_METRICS, totalPoolUsd, period);
}

/**
 * Hook with local state for interactive RIS exploration
 * Useful for dashboard pages where users can adjust parameters
 */
export function useInteractiveRIS(
  initialMetrics: LibraryRawMetrics[] = SAMPLE_RAW_METRICS,
  initialPool: number = 1_000_000
) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [totalPool, setTotalPool] = useState(initialPool);
  const [config, setConfig] = useState<Partial<RISConfig>>({});

  const allocation = useQuarterlyAllocation(
    metrics,
    totalPool,
    '2025-Q4',
    undefined,
    config
  );

  return {
    metrics,
    setMetrics,
    totalPool,
    setTotalPool,
    config,
    setConfig,
    allocation,
  };
}

// ============================================================================
// API-based Hooks (Real Data)
// ============================================================================

/**
 * Hook to fetch quarterly allocation from API
 * Uses SWR for caching and automatic revalidation
 *
 * @param period - Quarter period (e.g., "2025-Q4"), defaults to current
 * @returns SWR response with allocation data
 */
export function useRISAllocationFromAPI(period?: string) {
  const url = period
    ? `/api/ris/allocation?period=${period}`
    : '/api/ris/allocation';

  const { data, error, isLoading, mutate } = useSWR<QuarterlyAllocation>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0, // Don't auto-refresh (data changes infrequently)
    }
  );

  return {
    allocation: data,
    isLoading,
    isError: error,
    error,
    refetch: mutate,
  };
}

/**
 * Hook to fetch collection status
 * Useful for showing progress during data collection
 */
export function useCollectionStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/ris/status',
    fetcher,
    {
      refreshInterval: 5000, // Poll every 5 seconds during collection
      revalidateOnFocus: true,
    }
  );

  const isCollecting = data?.status?.status === 'running';

  return {
    status: data?.status || null,
    lastUpdated: data?.lastUpdated || null,
    currentQuarter: data?.currentQuarter || null,
    isCollecting,
    isLoading,
    isError: error,
    error,
    refetch: mutate,
  };
}

/**
 * Hook to trigger data collection
 * Returns a function to trigger collection and status
 */
export function useCollectRISData() {
  const [isCollecting, setIsCollecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const collect = async () => {
    setIsCollecting(true);
    setError(null);

    try {
      const response = await fetch('/api/ris/collect', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Collection failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsCollecting(false);
    }
  };

  return {
    collect,
    isCollecting,
    error,
  };
}

/**
 * Format RIS score as percentage
 */
export function formatRIS(ris: number): string {
  return `${(ris * 100).toFixed(1)}%`;
}

/**
 * Format allocation as currency
 */
export function formatAllocation(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usd);
}

/**
 * Get color class for RIS score (Tailwind CSS)
 */
export function getRISColorClass(ris: number): string {
  if (ris >= 0.8) return 'text-green-400';
  if (ris >= 0.6) return 'text-cyan-400';
  if (ris >= 0.4) return 'text-yellow-400';
  if (ris >= 0.2) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get badge color class for component score
 */
export function getComponentColorClass(component: string): string {
  const colors: Record<string, string> = {
    EF: 'bg-primary/20 text-blue-300',
    CQ: 'bg-success/20 text-green-300',
    MH: 'bg-accent/20 text-purple-300',
    CB: 'bg-warning/20 text-yellow-300',
    MA: 'bg-accent/20 text-pink-300',
  };
  return colors[component] || 'bg-muted/20 text-muted-foreground';
}

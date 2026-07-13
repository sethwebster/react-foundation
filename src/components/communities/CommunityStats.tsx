/**
 * Community Stats Component
 * Dynamically calculates and displays stats from Redis data
 */

'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CommunityStats() {
  const { data, isLoading, error } = useSWR('/api/communities/stats', fetcher);

  if (isLoading || !data) {
    return (
      <div className="flex flex-wrap items-start justify-center gap-x-16 gap-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 text-center">
            <div className="mx-auto h-10 w-20 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data.success) {
    return (
      <div className="text-center text-sm text-destructive">
        Failed to load stats
      </div>
    );
  }

  const { stats } = data;

  // Only show "Active" stat if >= 75% are active
  const activePercentage = stats.active_communities / stats.total_communities;
  const showActiveStat = activePercentage >= 0.75;

  return (
    <div className="flex flex-wrap items-start justify-center gap-x-16 gap-y-8">
      <Stat number={stats.total_communities.toString()} label="Communities" />
      <Stat number={stats.countries.toString()} label="Countries" />
      <Stat number={formatNumber(stats.total_members)} label="Members" />
      {showActiveStat && (
        <Stat number={stats.active_communities.toString()} label="Active" />
      )}
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {number}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k+`;
  return num.toString();
}

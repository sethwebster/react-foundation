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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-12 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-24 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data.success) {
    return (
      <div className="text-center text-destructive">
        Failed to load stats
      </div>
    );
  }

  const { stats } = data;

  // Only show "Active" stat if >= 75% are active
  const activePercentage = stats.active_communities / stats.total_communities;
  const showActiveStat = activePercentage >= 0.75;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${showActiveStat ? '4' : '3'} gap-8 text-center max-w-5xl mx-auto`}>
      <StatCard
        number={stats.total_communities.toString()}
        label="Communities"
      />
      <StatCard
        number={stats.countries.toString()}
        label="Countries"
      />
      <StatCard
        number={formatNumber(stats.total_members)}
        label="Total Members"
      />
      {showActiveStat && (
        <StatCard
          number={stats.active_communities.toString()}
          label="Active"
        />
      )}
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl md:text-5xl font-bold text-primary">
        {number}
      </div>
      <div className="text-sm md:text-base text-muted-foreground">{label}</div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
  return num.toString();
}

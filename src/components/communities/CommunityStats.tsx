/**
 * Community Stats Component
 * Dynamically calculates and displays stats from Redis data
 */

'use client';

import useSWR from 'swr';
import { Activity, Globe, MapPin, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { RowList } from '@/components/panels/panel';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CommunityStats() {
  const { data, isLoading, error } = useSWR('/api/communities/stats', fetcher);

  if (isLoading || !data) {
    return (
      <div className="mt-3 divide-y divide-[#EBECF0]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-[18px]">
            <div className="h-5 w-44 max-w-[50%] animate-pulse rounded bg-[#EBECF0]" />
            <div className="h-5 w-16 animate-pulse rounded bg-[#EBECF0]" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data.success) {
    return (
      <p className="mt-3 text-[15px] font-medium text-[#C76A15]">
        Failed to load stats
      </p>
    );
  }

  const { stats } = data;

  // Only show "Active" stat if >= 75% are active
  const activePercentage = stats.active_communities / stats.total_communities;
  const showActiveStat = activePercentage >= 0.75;

  return (
    <RowList className="mt-3">
      <StatRow
        icon={MapPin}
        number={stats.total_communities.toString()}
        label="Communities"
      />
      <StatRow
        icon={Globe}
        number={stats.countries.toString()}
        label="Countries"
      />
      <StatRow
        icon={Users}
        number={formatNumber(stats.total_members)}
        label="Total Members"
      />
      {showActiveStat && (
        <StatRow
          icon={Activity}
          number={stats.active_communities.toString()}
          label="Active"
        />
      )}
    </RowList>
  );
}

function StatRow({ icon: Icon, number, label }: { icon: LucideIcon; number: string; label: string }) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-x-5 py-[18px] text-[#16181D]">
      <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
      <span className="text-[17px] font-medium">{label}</span>
      <span className="font-mono-panels justify-self-end text-[15px] font-medium">{number}</span>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
  return num.toString();
}

'use client';

/**
 * Installation Status Dashboard
 * Shows which libraries have the GitHub App installed
 * and displays their current RIS scores and eligibility status
 */

import { useEffect, useState } from 'react';
import type { LibraryInstallationStatus } from '@/app/api/ris/installations/route';
import { getEligibilityBadgeInfo, type EligibilityStatus } from '@/lib/ris/eligibility';
import { RFDS } from '@/components/rfds';

interface InstallationStatusResponse {
  success: boolean;
  summary: {
    total: number;
    installed: number;
    withScores: number;
    realtimeUpdates: number;
    monthlyUpdates: number;
  };
  libraries: LibraryInstallationStatus[];
  timestamp: string;
}

type SortField = 'name' | 'score' | 'updated' | 'status';
type SortDirection = 'asc' | 'desc';

export function InstallationStatusDashboard() {
  const [data, setData] = useState<InstallationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'installed' | 'monthly'>('all');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data on mount and every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ris/installations');
        if (!response.ok) {
          throw new Error('Failed to fetch installation status');
        }
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/10 bg-muted/60 p-8 text-center">
        <div className="text-foreground/60">Loading installation status...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
        <div className="text-destructive">Error: {error || 'Failed to load data'}</div>
      </div>
    );
  }

  // Filter libraries
  let filtered = data.libraries;

  if (filter === 'installed') {
    filtered = filtered.filter(lib => lib.installed);
  } else if (filter === 'monthly') {
    filtered = filtered.filter(lib => !lib.installed && lib.score !== null);
  }

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(lib =>
      lib.name.toLowerCase().includes(query) ||
      lib.owner.toLowerCase().includes(query)
    );
  }

  // Sort libraries
  filtered = [...filtered].sort((a, b) => {
    let aVal: string | number | null;
    let bVal: string | number | null;

    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'score':
        aVal = a.score || 0;
        bVal = b.score || 0;
        break;
      case 'updated':
        aVal = a.lastUpdated || '';
        bVal = b.lastUpdated || '';
        break;
      case 'status':
        aVal = a.installed ? 2 : a.score ? 1 : 0;
        bVal = b.installed ? 2 : b.score ? 1 : 0;
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Libraries"
          value={data.summary.total}
          icon="📚"
        />
        <StatCard
          label="Real-time Updates"
          value={data.summary.realtimeUpdates}
          icon="⚡"
          highlight
        />
        <StatCard
          label="Monthly Updates"
          value={data.summary.monthlyUpdates}
          icon="📅"
        />
        <StatCard
          label="With Scores"
          value={data.summary.withScores}
          icon="📊"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({data.libraries.length})
          </FilterButton>
          <FilterButton
            active={filter === 'installed'}
            onClick={() => setFilter('installed')}
          >
            ⚡ Real-time ({data.summary.realtimeUpdates})
          </FilterButton>
          <FilterButton
            active={filter === 'monthly'}
            onClick={() => setFilter('monthly')}
          >
            📅 Monthly ({data.summary.monthlyUpdates})
          </FilterButton>
        </div>

        <RFDS.SearchInput
          placeholder="Search libraries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border border-border bg-background/50 px-4 py-2 text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/10 bg-muted/60">
        <table className="w-full">
          <thead className="border-b border-border/10 bg-background/30">
            <tr>
              <th className="p-4 text-left">
                <SortButton
                  active={sortField === 'name'}
                  direction={sortDirection}
                  onClick={() => toggleSort('name')}
                >
                  Library
                </SortButton>
              </th>
              <th className="p-4 text-left">
                <SortButton
                  active={sortField === 'status'}
                  direction={sortDirection}
                  onClick={() => toggleSort('status')}
                >
                  Status
                </SortButton>
              </th>
              <th className="p-4 text-left">
                Eligibility
              </th>
              <th className="p-4 text-right">
                <SortButton
                  active={sortField === 'score'}
                  direction={sortDirection}
                  onClick={() => toggleSort('score')}
                >
                  Score
                </SortButton>
              </th>
              <th className="p-4 text-left">
                <SortButton
                  active={sortField === 'updated'}
                  direction={sortDirection}
                  onClick={() => toggleSort('updated')}
                >
                  Last Updated
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lib) => (
              <tr
                key={`${lib.owner}/${lib.name}`}
                className="border-b border-border/5 transition-colors hover:bg-background/30"
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium text-foreground">
                      {lib.name}
                    </div>
                    <div className="text-sm text-foreground/60">
                      {lib.owner}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <StatusBadge updateMethod={lib.updateMethod} />
                </td>
                <td className="p-4">
                  {lib.eligibility ? (
                    <EligibilityBadge
                      status={lib.eligibility.status}
                      adjustment={lib.eligibility.adjustment}
                    />
                  ) : (
                    <span className="text-xs text-foreground/40">Not set</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {lib.score !== null ? (
                    <div className="font-semibold text-foreground">
                      {lib.score}
                      <span className="text-sm text-foreground/60">/100</span>
                    </div>
                  ) : (
                    <div className="text-foreground/40">—</div>
                  )}
                </td>
                <td className="p-4 text-sm text-foreground/70">
                  {lib.lastUpdated ? formatDate(lib.lastUpdated) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-foreground/60">
            No libraries found
          </div>
        )}
      </div>

      <div className="text-center text-sm text-foreground/60">
        Last updated: {formatDate(data.timestamp)}
      </div>
    </div>
  );
}

// Helper Components

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <RFDS.StatCard
      label={label}
      value={value.toString()}
      icon={icon}
      highlight={highlight}
      color="primary"
      variant="outlined"
    />
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <RFDS.SemanticButton
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      onClick={onClick}
    >
      {children}
    </RFDS.SemanticButton>
  );
}

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <RFDS.SemanticButton
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-foreground"
    >
      {children}
      {active && (
        <span className="text-primary">
          {direction === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </RFDS.SemanticButton>
  );
}

function StatusBadge({ updateMethod }: { updateMethod: 'realtime' | 'monthly' | 'never' }) {
  if (updateMethod === 'realtime') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
        <span className="animate-pulse">⚡</span>
        Real-time
      </span>
    );
  }

  if (updateMethod === 'monthly') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning">
        📅 Monthly
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground/60">
      ⏳ Not tracked
    </span>
  );
}

function EligibilityBadge({
  status,
  adjustment,
}: {
  status: EligibilityStatus;
  adjustment: number;
}) {
  const badgeInfo = getEligibilityBadgeInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
        badgeInfo.color === 'success'
          ? 'bg-success/20 text-success-foreground'
          : badgeInfo.color === 'warning'
          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
          : 'bg-destructive/20 text-destructive-foreground'
      }`}
    >
      {badgeInfo.emoji} {badgeInfo.label}
      {adjustment < 1.0 && (
        <span className="opacity-70">({(adjustment * 100).toFixed(0)}%)</span>
      )}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

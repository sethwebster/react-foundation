/**
 * Community Filters Component
 * Filter communities by search, status, event type, and tier.
 * Presented as a horizontal filter bar; state is synced to the URL query string.
 */

'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RFDS } from '@/components/rfds';
import { SortDropdown } from '@/components/ui/sort-dropdown';
import type {
  CommunityFilters as Filters,
  CommunityStatusFilter,
  EventType,
} from '@/types/community';

const STATUS_OPTIONS: Array<{ value: CommunityStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'inactive', label: 'Inactive' },
];

const EVENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'study-group', label: 'Study group' },
  { value: 'virtual', label: 'Virtual' },
];

const TIER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All tiers' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
];

function useClearDebounceOnUnmount(
  timer: RefObject<ReturnType<typeof setTimeout> | null>,
) {
  useEffect(() => {
    function clearDebounce() {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    }

    return clearDebounce;
  }, [timer]);
}

export function CommunityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<Filters>(() => {
    const params = searchParams;
    const statusParam = params.get('status');
    return {
      search: params.get('search') || undefined,
      country: params.get('country') || undefined,
      status: statusParam ? (statusParam as Filters['status']) : 'all',
      cois_tier: (params.get('tier') as Filters['cois_tier']) || undefined,
      verified_only: params.get('verified') === 'true',
      has_upcoming_events: params.get('upcoming') === 'true',
      event_types:
        (params.get('types')?.split(',').filter(Boolean) as EventType[]) || [],
    };
  });

  const updateFilter = <K extends keyof Filters>(
    key: K,
    value: Filters[K],
    debounce = false,
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (debounce) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        applyFilters(newFilters);
      }, 300);
    } else {
      applyFilters(newFilters);
    }
  };

  useClearDebounceOnUnmount(debounceTimer);

  const applyFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.country) params.set('country', newFilters.country);

    const statusValue = newFilters.status as string;
    if (statusValue && statusValue !== 'all') {
      params.set('status', statusValue);
    }

    if (newFilters.cois_tier) params.set('tier', newFilters.cois_tier);
    if (newFilters.has_upcoming_events) params.set('upcoming', 'true');

    if (newFilters.event_types && newFilters.event_types.length > 0) {
      params.set('types', newFilters.event_types.join(','));
    }

    const queryString = params.toString();
    router.push(queryString ? `/communities?${queryString}` : '/communities', {
      scroll: false,
    });
  };

  const clearFilters = () => {
    const defaultFilters: Filters = {
      status: 'all',
      event_types: [],
      verified_only: false,
      has_upcoming_events: false,
    };
    setFilters(defaultFilters);
    router.push('/communities', { scroll: false });
  };

  const hasActiveFilters =
    filters.search ||
    filters.country ||
    (filters.event_types && filters.event_types.length > 0) ||
    filters.cois_tier ||
    filters.has_upcoming_events ||
    (filters.status && filters.status !== 'all');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      {/* Search */}
      <div className="flex-1 sm:min-w-[220px]">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Search
        </label>
        <RFDS.SearchInput
          placeholder="City, country, or name..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value, true)}
          className="w-full"
        />
      </div>

      {/* Status */}
      <div className="sm:w-40">
        <SortDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={(filters.status as string) || 'all'}
          onChange={(value) => updateFilter('status', value as Filters['status'])}
        />
      </div>

      {/* Event type */}
      <div className="sm:w-44">
        <SortDropdown
          label="Event type"
          options={EVENT_TYPE_OPTIONS}
          value={filters.event_types?.[0] || ''}
          onChange={(value) =>
            updateFilter('event_types', value ? [value as EventType] : [])
          }
        />
      </div>

      {/* Tier */}
      <div className="sm:w-40">
        <SortDropdown
          label="Tier"
          options={TIER_OPTIONS}
          value={filters.cois_tier || ''}
          onChange={(value) =>
            updateFilter('cois_tier', (value || undefined) as Filters['cois_tier'])
          }
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:pb-2.5"
        >
          Clear
        </button>
      )}
    </div>
  );
}

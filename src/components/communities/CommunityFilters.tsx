/**
 * Community Filters Component
 * Filter communities by location, type, status, etc.
 */

'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { SortDropdown } from '@/components/ui/sort-dropdown';
import type { CommunityFilters as Filters, CommunityStatusFilter, EventType } from '@/types/community';

const STATUS_OPTIONS: Array<{ value: CommunityStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'inactive', label: 'Inactive' },
];

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-[#16181D]';

function useClearDebounceOnUnmount(timer: RefObject<ReturnType<typeof setTimeout> | null>) {
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

  // Initialize with defaults
  const [filters, setFilters] = useState<Filters>(() => {
    const params = searchParams;
    const statusParam = params.get('status');
    return {
      search: params.get('search') || undefined,
      country: params.get('country') || undefined,
      status: statusParam ? (statusParam as Filters['status']) : 'all',
      cois_tier: params.get('tier') as Filters['cois_tier'] || undefined,
      verified_only: params.get('verified') === 'true',
      has_upcoming_events: params.get('upcoming') === 'true',
      event_types: params.get('types')?.split(',').filter(Boolean) as EventType[] || [],
    };
  });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K], debounce = false) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (debounce) {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
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

    // Add event types if any are selected
    if (newFilters.event_types && newFilters.event_types.length > 0) {
      params.set('types', newFilters.event_types.join(','));
      console.log('🔍 Event types filter:', newFilters.event_types);
    }

    const queryString = params.toString();
    router.push(queryString ? `/communities?${queryString}` : '/communities', { scroll: false });
  };

  const toggleEventType = (type: EventType) => {
    const current = filters.event_types || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    const newFilters = { ...filters, event_types: updated };
    setFilters(newFilters);
    applyFilters(newFilters);
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
    <div className="space-y-6 rounded-2xl border border-[#EBECF0] bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold text-[#16181D]">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={`panels-anim text-[13px] font-semibold text-[#087EA4] hover:text-[#16181D] ${FOCUS_RING}`}
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-[#16181D]">
          Status
        </span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const selected = (filters.status || 'all') === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFilter('status', option.value)}
                className={selected
                  ? `panels-anim rounded-full border border-[#16181D] bg-[#16181D] px-3 py-1.5 text-[13px] font-medium text-[#F6F7F9]! ${FOCUS_RING}`
                  : `panels-anim rounded-full border border-[rgba(22,24,29,0.2)] px-3 py-1.5 text-[13px] font-medium text-[#5E687E] hover:bg-[rgba(22,24,29,0.08)] hover:text-[#16181D] ${FOCUS_RING}`
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="community-search" className="mb-2 block text-sm font-medium text-[#16181D]">
          Search
        </label>
        <div className="relative w-full">
          <Search
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5E687E]"
          />
          <input
            id="community-search"
            type="search"
            placeholder="City, country, or name..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value, true)}
            className={`panels-anim w-full rounded-xl border border-[rgba(22,24,29,0.2)] bg-white py-2.5 pl-9 pr-3 text-sm text-[#16181D] placeholder:text-[#99A1B3] ${FOCUS_RING}`}
          />
        </div>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-[#16181D]">
          Event Types
        </span>
        <div className="space-y-2">
          {(['meetup', 'conference', 'workshop', 'hackathon', 'virtual'] as EventType[]).map(
            (type) => (
              <label key={type} className="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.event_types?.includes(type) || false}
                  onChange={() => toggleEventType(type)}
                  className={`h-4 w-4 accent-[#087EA4] ${FOCUS_RING}`}
                />
                <span className="panels-anim text-sm capitalize text-[#16181D] group-hover:text-[#087EA4]">
                  {type}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-[#16181D]">
          CoIS Tier
        </span>
        <SortDropdown
          options={[
            { value: '', label: 'All Tiers' },
            { value: 'platinum', label: 'Platinum' },
            { value: 'gold', label: 'Gold' },
            { value: 'silver', label: 'Silver' },
            { value: 'bronze', label: 'Bronze' },
          ]}
          value={filters.cois_tier || ''}
          onChange={(value) => updateFilter('cois_tier', value as Filters['cois_tier'])}
        />
      </div>

      {/* Apply button (for mobile) */}
      <button
        type="button"
        className={`panels-anim w-full rounded-xl border border-[#16181D] bg-[#16181D] px-6 py-3.5 text-[15px] font-semibold leading-[1.2] text-[#F6F7F9]! hover:border-[#07090D] hover:bg-[#07090D] lg:hidden ${FOCUS_RING}`}
      >
        Apply Filters
      </button>
    </div>
  );
}

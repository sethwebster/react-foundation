/**
 * Community Filters Component
 * Filter communities by location, type, status, etc.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SortDropdown } from '@/components/ui/sort-dropdown';
import type { CommunityFilters as Filters, EventType } from '@/types/community';

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
      status: statusParam ? (statusParam as Filters['status']) : 'active', // Default to active if no param
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const applyFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.country) params.set('country', newFilters.country);

    // Always add status to URL to be explicit
    const statusValue = newFilters.status as string;
    if (statusValue === 'all') {
      params.set('status', 'all');
    } else if (statusValue) {
      params.set('status', statusValue);
    } else {
      params.set('status', 'active'); // Explicit default
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
      status: 'active' as any, // Reset to default
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
    (filters.status && filters.status !== 'active'); // active is default

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="City, country, or name..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value, true)}
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Event Types */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Event Types
        </label>
        <div className="space-y-2">
          {(['meetup', 'conference', 'workshop', 'hackathon', 'virtual'] as EventType[]).map(
            (type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.event_types?.includes(type) || false}
                  onChange={() => toggleEventType(type)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-foreground capitalize group-hover:text-primary transition">
                  {type}
                </span>
              </label>
            )
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <SortDropdown
          label="Community Status"
          options={[
            { value: 'active', label: '✓ Active Only' },
            { value: 'all', label: '📋 All Statuses' },
            { value: 'new', label: '✨ New' },
            { value: 'paused', label: '⏸️ Paused' },
            { value: 'inactive', label: '💤 Inactive' },
          ]}
          value={filters.status || 'active'}
          onChange={(value) => updateFilter('status', value as Filters['status'])}
        />
      </div>

      {/* CoIS Tier */}
      <div>
        <SortDropdown
          label="CoIS Tier"
          options={[
            { value: '', label: '🎯 All Tiers' },
            { value: 'platinum', label: '💎 Platinum' },
            { value: 'gold', label: '🏆 Gold' },
            { value: 'silver', label: '🥈 Silver' },
            { value: 'bronze', label: '🥉 Bronze' },
          ]}
          value={filters.cois_tier || ''}
          onChange={(value) => updateFilter('cois_tier', value as Filters['cois_tier'])}
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-border">
        {/* Removed "Verified only" - all communities are verified */}

        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.has_upcoming_events || false}
            onChange={(e) => updateFilter('has_upcoming_events', e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-foreground group-hover:text-primary transition">
            Has upcoming events
          </span>
        </label>
      </div>

      {/* Apply button (for mobile) */}
      <button className="w-full lg:hidden bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:bg-primary/90 transition">
        Apply Filters
      </button>
    </div>
  );
}

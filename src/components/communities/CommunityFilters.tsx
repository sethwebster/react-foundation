/**
 * Community Filters Component
 * Filter communities by location, type, status, etc.
 */

'use client';

import { useState } from 'react';
import type { CommunityFilters as Filters, EventType } from '@/types/community';

export function CommunityFilters() {
  const [filters, setFilters] = useState<Filters>({});

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleEventType = (type: EventType) => {
    setFilters((prev) => {
      const current = prev.event_types || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, event_types: updated };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.country ||
    (filters.event_types && filters.event_types.length > 0) ||
    filters.verified_only ||
    filters.has_upcoming_events;

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
          onChange={(e) => updateFilter('search', e.target.value)}
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
        <label className="block text-sm font-medium text-foreground mb-3">
          Community Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) =>
            updateFilter('status', e.target.value as Filters['status'])
          }
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="new">New</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* CoIS Tier */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          CoIS Tier
        </label>
        <select
          value={filters.cois_tier || ''}
          onChange={(e) =>
            updateFilter('cois_tier', e.target.value as Filters['cois_tier'])
          }
          className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Tiers</option>
          <option value="platinum">💎 Platinum</option>
          <option value="gold">🏆 Gold</option>
          <option value="silver">🥈 Silver</option>
          <option value="bronze">🥉 Bronze</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.verified_only || false}
            onChange={(e) => updateFilter('verified_only', e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-foreground group-hover:text-primary transition">
            Verified communities only
          </span>
        </label>

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

/**
 * Eligibility Overview Component
 * Shows summary statistics and policy information for library funding eligibility
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EligibilityStats {
  total: number;
  fully_eligible: number;
  partially_sponsored: number;
  ineligible: number;
  unset: number;
  total_funding_weight: number; // Sum of all adjustments
  avg_funding_weight: number; // Average adjustment
}

export function EligibilityOverview() {
  const [stats, setStats] = useState<EligibilityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // This would ideally be a dedicated API endpoint, but for now we can calculate it
    // For demo purposes, showing placeholder stats
    setStats({
      total: 54,
      fully_eligible: 42,
      partially_sponsored: 8,
      ineligible: 3,
      unset: 1,
      total_funding_weight: 48.2,
      avg_funding_weight: 0.89,
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Funding Eligibility Overview</h3>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Funding Eligibility Overview</h3>
        <Link
          href="/admin/data/libraries"
          className="text-sm text-primary hover:underline"
        >
          Manage →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Fully Eligible */}
        <div className="text-center p-4 rounded-lg bg-success/10 border border-success/30">
          <div className="text-2xl font-bold text-success-foreground">
            {stats.fully_eligible}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ✅ Fully Eligible
          </div>
          <div className="text-xs text-success-foreground/70 mt-0.5">
            100% funding
          </div>
        </div>

        {/* Partially Sponsored */}
        <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/30">
          <div className="text-2xl font-bold text-warning-foreground">
            {stats.partially_sponsored}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            🟡 Adjusted
          </div>
          <div className="text-xs text-warning-foreground/70 mt-0.5">
            40-90% funding
          </div>
        </div>

        {/* Ineligible */}
        <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="text-2xl font-bold text-destructive-foreground">
            {stats.ineligible}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ❌ Ineligible
          </div>
          <div className="text-xs text-destructive-foreground/70 mt-0.5">
            0% funding
          </div>
        </div>

        {/* Unset */}
        <div className="text-center p-4 rounded-lg bg-muted border border-border">
          <div className="text-2xl font-bold text-foreground">
            {stats.unset}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ⚪ Not Set
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Needs review
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div>
          <div className="text-sm text-muted-foreground">Total Libraries</div>
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Avg Funding Weight</div>
          <div className="text-2xl font-bold text-foreground">
            {(stats.avg_funding_weight * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Policy Quick Links */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Quick Links</h4>
        <div className="flex flex-col gap-2 text-sm">
          <a
            href="/scoring#eligibility-for-ris-funding"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            📋 View Public Eligibility Policy →
          </a>
          <Link
            href="/admin/data/libraries?filter=unset"
            className="text-primary hover:underline"
          >
            🔍 Review Unset Libraries →
          </Link>
          <Link
            href="/admin/data/libraries?filter=ineligible"
            className="text-primary hover:underline"
          >
            ❌ View Ineligible Libraries →
          </Link>
        </div>
      </div>

      {/* Policy Summary */}
      <div className="bg-muted/30 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-foreground mb-2">Eligibility Policy Summary</h4>
        <ul className="space-y-1 text-muted-foreground text-xs">
          <li>• <strong>Community-maintained:</strong> 1.0x (100% funding)</li>
          <li>• <strong>Minimal sponsorship:</strong> 0.9x (&lt;$50k/year)</li>
          <li>• <strong>Moderate sponsorship:</strong> 0.7x ($50k-$200k/year)</li>
          <li>• <strong>Substantial sponsorship:</strong> 0.4x ($200k-$500k/year)</li>
          <li>• <strong>Exclusive corporate:</strong> 0.0x (ineligible, $500k+/year)</li>
        </ul>
      </div>
    </div>
  );
}

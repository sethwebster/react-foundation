'use client';

import { useState, useEffect } from 'react';
import {
  type EligibilityStatus,
  type SponsorshipLevel,
  getSponsorshipAdjustment,
  getSponsorshipDescription,
  getEligibilityDescription,
  getEligibilityBadgeInfo,
} from '@/lib/ris/eligibility';

interface LibraryEligibilityEditorProps {
  owner: string;
  repo: string;
  libraryName: string;
  onUpdate?: () => void;
}

interface EligibilityData {
  status: EligibilityStatus;
  level: SponsorshipLevel;
  adjustment: number;
  notes: string;
  last_reviewed: string | null;
}

export function LibraryEligibilityEditor({
  owner,
  repo,
  libraryName,
  onUpdate,
}: LibraryEligibilityEditorProps) {
  const [eligibility, setEligibility] = useState<EligibilityData>({
    status: 'fully_eligible',
    level: 'none',
    adjustment: 1.0,
    notes: '',
    last_reviewed: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current eligibility data
  useEffect(() => {
    fetchEligibility();
  }, [owner, repo]);

  const fetchEligibility = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/libraries/eligibility?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
      );

      if (response.ok) {
        const data = await response.json();
        setEligibility(data.eligibility);
      }
    } catch (err) {
      console.error('Failed to fetch eligibility:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSponsorshipLevelChange = (level: SponsorshipLevel) => {
    const adjustment = getSponsorshipAdjustment(level);
    setEligibility(prev => ({
      ...prev,
      level,
      adjustment,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/admin/libraries/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          eligibility_status: eligibility.status,
          sponsorship_level: eligibility.level,
          eligibility_notes: eligibility.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await response.json();
      setEligibility(data.eligibility);
      setIsEditing(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const badgeInfo = getEligibilityBadgeInfo(eligibility.status);

  if (isLoading) {
    return <div className="text-sm text-foreground/60">Loading eligibility data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Funding Eligibility</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Edit
          </button>
        )}
      </div>

      {/* Current Status Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium
            ${badgeInfo.color === 'success' ? 'bg-success/20 text-success-foreground' : ''}
            ${badgeInfo.color === 'warning' ? 'bg-warning/20 text-warning-foreground' : ''}
            ${badgeInfo.color === 'destructive' ? 'bg-destructive/20 text-destructive-foreground' : ''}
          `}
        >
          {badgeInfo.emoji} {badgeInfo.label}
        </span>
        <span className="text-sm text-foreground/60">
          ({(eligibility.adjustment * 100).toFixed(0)}% funding weight)
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
          {/* Eligibility Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Eligibility Status
            </label>
            <select
              value={eligibility.status}
              onChange={(e) => setEligibility(prev => ({ ...prev, status: e.target.value as EligibilityStatus }))}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="fully_eligible">✅ Fully Eligible</option>
              <option value="partially_sponsored">🟡 Partially Sponsored</option>
              <option value="ineligible">❌ Ineligible</option>
            </select>
            <p className="mt-1 text-xs text-foreground/60">
              {getEligibilityDescription(eligibility.status)}
            </p>
          </div>

          {/* Sponsorship Level */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sponsorship Level
            </label>
            <select
              value={eligibility.level}
              onChange={(e) => handleSponsorshipLevelChange(e.target.value as SponsorshipLevel)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="none">None (1.0x funding)</option>
              <option value="minimal">Minimal (0.9x funding)</option>
              <option value="moderate">Moderate (0.7x funding)</option>
              <option value="substantial">Substantial (0.4x funding)</option>
              <option value="exclusive">Exclusive (0.0x - ineligible)</option>
            </select>
            <p className="mt-1 text-xs text-foreground/60">
              {getSponsorshipDescription(eligibility.level)}
            </p>
          </div>

          {/* Adjustment Factor (read-only, calculated) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Funding Weight Adjustment
            </label>
            <div className="px-3 py-2 border border-border rounded-md bg-muted/50 text-foreground font-mono">
              {eligibility.adjustment.toFixed(2)}x ({(eligibility.adjustment * 100).toFixed(0)}%)
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              Automatically calculated based on sponsorship level
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Eligibility Notes (Rationale)
            </label>
            <textarea
              value={eligibility.notes}
              onChange={(e) => setEligibility(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Document the rationale for this eligibility decision..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none"
            />
            <p className="mt-1 text-xs text-foreground/60">
              Explain corporate relationships, funding sources, and decision rationale
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-3 py-2 rounded-md bg-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
                fetchEligibility(); // Reset to saved values
              }}
              disabled={isSaving}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {/* Display Mode */}
          <div>
            <span className="text-foreground/60">Sponsorship Level:</span>{' '}
            <span className="font-medium text-foreground">
              {eligibility.level.charAt(0).toUpperCase() + eligibility.level.slice(1)}
            </span>
          </div>

          {eligibility.notes && (
            <div>
              <span className="text-foreground/60">Notes:</span>
              <p className="mt-1 text-foreground/80 whitespace-pre-wrap bg-muted/30 p-3 rounded">
                {eligibility.notes}
              </p>
            </div>
          )}

          {eligibility.last_reviewed && (
            <div className="text-xs text-foreground/50">
              Last reviewed: {new Date(eligibility.last_reviewed).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

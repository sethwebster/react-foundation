/**
 * Library List Component - Server Component
 * Pure presentational component that accepts data as props
 * NO data fetching, NO useEffect, NO business logic
 */

import { LibraryCard } from './LibraryCard';
import { type EligibilityStatus, getEligibilityBadgeInfo } from '@/lib/ris/eligibility';

export interface LibraryWithEligibility {
  owner: string;
  repo: string;
  name: string;
  github: string;
  eligibility?: {
    status: EligibilityStatus;
    adjustment: number;
  };
}

interface LibraryListProps {
  libraries: LibraryWithEligibility[];
  showHeader?: boolean;
}

export function LibraryList({ libraries, showHeader = true }: LibraryListProps) {
  // Calculate stats
  const stats = {
    total: libraries.length,
    fully_eligible: libraries.filter(lib => lib.eligibility?.status === 'fully_eligible').length,
    partially_sponsored: libraries.filter(lib => lib.eligibility?.status === 'partially_sponsored').length,
    ineligible: libraries.filter(lib => lib.eligibility?.status === 'ineligible').length,
    unset: libraries.filter(lib => !lib.eligibility).length,
  };

  return (
    <div className="space-y-4">
      {/* Header - optional */}
      {showHeader && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              All Libraries ({libraries.length})
            </h3>
            <p className="text-sm text-muted-foreground">
              React ecosystem libraries tracked for RIS
            </p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-4 flex-wrap text-sm border-t border-b border-border py-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">✅ Fully Eligible:</span>
          <span className="font-semibold text-success-foreground">{stats.fully_eligible}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">🟡 Adjusted:</span>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.partially_sponsored}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">❌ Ineligible:</span>
          <span className="font-semibold text-destructive-foreground">{stats.ineligible}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">⚪ Unset:</span>
          <span className="font-semibold text-muted-foreground">{stats.unset}</span>
        </div>
      </div>

      {/* Library Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {libraries.map((library) => (
          <LibraryCard
            key={`${library.owner}/${library.repo}`}
            library={library}
            eligibility={library.eligibility}
          />
        ))}
      </div>
    </div>
  );
}

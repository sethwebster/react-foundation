/**
 * Library List Component - Client Component
 * Displays libraries in a table format with RIS scores and eligibility status
 * Uses RFDS Table component for consistent styling
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { RFDS, type TableColumn } from '@/components/rfds';
import { LibraryDetailModal } from './LibraryDetailModal';
import { type EligibilityStatus, getEligibilityBadgeInfo } from '@/lib/ris/eligibility';

export interface LibraryWithEligibility {
  owner: string;
  repo: string;
  name: string;
  github: string;
  risScore?: number; // RIS score (0-1 scale)
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

  // Define table columns
  const columns: TableColumn<LibraryWithEligibility>[] = [
    {
      key: 'library',
      label: 'Library',
      sortable: true,
      render: (_value: unknown, library: LibraryWithEligibility) => (
        <div>
          <div className="font-semibold text-foreground">{library.name}</div>
          <a
            href={library.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition"
            onClick={(e) => e.stopPropagation()}
          >
            {library.owner}/{library.repo}
          </a>
        </div>
      ),
      accessor: (library: LibraryWithEligibility) => 
        `${library.name} ${library.owner} ${library.repo}`.toLowerCase(),
    },
    {
      key: 'risScore',
      label: 'RIS Score',
      sortable: true,
      align: 'left',
      render: (_value: unknown, library: LibraryWithEligibility) => {
        if (library.risScore === undefined) {
          return <span className="text-muted-foreground text-sm">N/A</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {(library.risScore * 100).toFixed(2)}%
            </span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${library.risScore * 100}%` }}
              />
            </div>
          </div>
        );
      },
      accessor: (library: LibraryWithEligibility) => {
        if (library.risScore === undefined) return 'n/a';
        return `${(library.risScore * 100).toFixed(2)}% ${library.risScore}`;
      },
    },
    {
      key: 'eligibility',
      label: 'Eligibility',
      sortable: true,
      render: (_value: unknown, library: LibraryWithEligibility) => {
        if (!library.eligibility) {
          return <RFDS.SemanticBadge variant="outline">Unset</RFDS.SemanticBadge>;
        }
        return (
          <EligibilityBadge
            status={library.eligibility.status}
            adjustment={library.eligibility.adjustment}
          />
        );
      },
      accessor: (library: LibraryWithEligibility) => {
        if (!library.eligibility) return 'unset';
        const badgeInfo = getEligibilityBadgeInfo(library.eligibility.status);
        const adjustmentText = library.eligibility.adjustment < 1.0 
          ? ` ${(library.eligibility.adjustment * 100).toFixed(0)}%` 
          : '';
        return `${badgeInfo.label} ${badgeInfo.emoji} ${library.eligibility.status}${adjustmentText}`.toLowerCase();
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_value: unknown, library: LibraryWithEligibility) => <LibraryTableActions library={library} />,
    },
  ];

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
          <span className="font-semibold text-warning-foreground">{stats.partially_sponsored}</span>
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

      {/* Library Table using RFDS.Table */}
      <RFDS.Table
        data={libraries}
        columns={columns}
        searchable
        searchPlaceholder="Search libraries..."
        defaultSortKey="risScore"
        defaultSortDirection="desc"
        getRowKey={(library) => `${library.owner}/${library.repo}`}
      />
    </div>
  );
}

// Eligibility Badge Component using RFDS
function EligibilityBadge({
  status,
  adjustment,
}: {
  status: EligibilityStatus;
  adjustment: number;
}) {
  const badgeInfo = getEligibilityBadgeInfo(status);
  const variantMap: Record<'success' | 'warning' | 'destructive', 'success' | 'warning' | 'destructive' | 'outline'> = {
    success: 'success',
    warning: 'warning',
    destructive: 'destructive',
  };

  return (
    <RFDS.SemanticBadge variant={variantMap[badgeInfo.color]}>
      {badgeInfo.emoji} {badgeInfo.label}
      {adjustment < 1.0 && (
        <span className="ml-1 opacity-70">
          ({(adjustment * 100).toFixed(0)}%)
        </span>
      )}
    </RFDS.SemanticBadge>
  );
}

// Library Table Actions Component
function LibraryTableActions({
  library,
}: {
  library: LibraryWithEligibility;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <>
      <RFDS.SemanticButton
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-10 w-10 p-0"
        title="View Details"
        aria-label="View library details"
      >
        <Eye className="h-6 w-6" />
      </RFDS.SemanticButton>
      {isModalOpen && (
        <LibraryDetailModal
          library={library}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

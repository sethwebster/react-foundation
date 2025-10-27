/**
 * Library Card - Client Component
 * Minimal client component for library card with modal interaction
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LibraryDetailModal } from './LibraryDetailModal';
import { type EligibilityStatus, getEligibilityBadgeInfo } from '@/lib/ris/eligibility';

interface LibraryCardProps {
  library: {
    owner: string;
    repo: string;
    name: string;
    github: string;
  };
  eligibility?: {
    status: EligibilityStatus;
    adjustment: number;
  };
}

export function LibraryCard({ library, eligibility }: LibraryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refresh server component data to get updated eligibility
    router.refresh();
  };

  const badgeInfo = eligibility
    ? getEligibilityBadgeInfo(eligibility.status)
    : null;

  return (
    <>
      <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition cursor-pointer">
        {/* Eligibility Badge */}
        {badgeInfo && eligibility && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                badgeInfo.color === 'success'
                  ? 'bg-success/20 text-success-foreground'
                  : badgeInfo.color === 'warning'
                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  : 'bg-destructive/20 text-destructive-foreground'
              }`}
            >
              {badgeInfo.emoji} {badgeInfo.label}
              {eligibility.adjustment < 1.0 && (
                <span className="opacity-70">
                  ({(eligibility.adjustment * 100).toFixed(0)}%)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Library Info */}
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {library.name}
        </h3>
        <a
          href={library.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-primary transition"
          onClick={(e) => e.stopPropagation()}
        >
          {library.owner}/{library.repo}
        </a>

        {/* View Details Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 w-full rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
        >
          View Details
        </button>
      </div>

      {/* Modal */}
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

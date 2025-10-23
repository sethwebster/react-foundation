/**
 * RIS Library Rankings Component
 * Displays libraries sorted by RIS score with key metrics
 */

'use client';

import { useState } from 'react';
import { type LibraryScore } from '@/lib/ris';
import {
  formatRIS,
  formatAllocation,
  getRISColorClass,
  getComponentColorClass,
} from '@/lib/ris';
import { LibraryIcon } from '@/lib/library-icons';

interface RISLibraryRankingsProps {
  libraries: LibraryScore[];
  showAllocation?: boolean;
  highlightTop?: number; // Highlight top N libraries
}

export function RISLibraryRankings({
  libraries,
  showAllocation = true,
  highlightTop = 3,
}: RISLibraryRankingsProps) {
  const [expandedLibrary, setExpandedLibrary] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'ris' | 'allocation' | 'ef' | 'cq' | 'mh'>('ris');

  // Sort libraries
  const sortedLibraries = [...libraries].sort((a, b) => {
    switch (sortBy) {
      case 'allocation':
        return b.allocation_usd - a.allocation_usd;
      case 'ef':
      case 'cq':
      case 'mh':
        return b[sortBy] - a[sortBy];
      default:
        return b.ris - a.ris;
    }
  });

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-foreground/60">Sort by:</span>
        <button
          onClick={() => setSortBy('ris')}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            sortBy === 'ris'
              ? 'bg-primary/20 text-cyan-300'
              : 'text-foreground/60 hover:bg-background/5 hover:text-foreground'
          }`}
        >
          RIS Score
        </button>
        {showAllocation && (
          <button
            onClick={() => setSortBy('allocation')}
            className={`rounded px-2 py-1 text-xs font-medium transition ${
              sortBy === 'allocation'
                ? 'bg-primary/20 text-cyan-300'
                : 'text-foreground/60 hover:bg-background/5 hover:text-foreground'
            }`}
          >
            Allocation
          </button>
        )}
        <button
          onClick={() => setSortBy('ef')}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            sortBy === 'ef'
              ? 'bg-primary/20 text-blue-300'
              : 'text-foreground/60 hover:bg-background/5 hover:text-foreground'
          }`}
        >
          Ecosystem
        </button>
        <button
          onClick={() => setSortBy('cq')}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            sortBy === 'cq'
              ? 'bg-success/20 text-green-300'
              : 'text-foreground/60 hover:bg-background/5 hover:text-foreground'
          }`}
        >
          Quality
        </button>
        <button
          onClick={() => setSortBy('mh')}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            sortBy === 'mh'
              ? 'bg-accent/20 text-purple-300'
              : 'text-foreground/60 hover:bg-background/5 hover:text-foreground'
          }`}
        >
          Health
        </button>
      </div>

      {/* Library List */}
      <div className="space-y-2">
        {sortedLibraries.map((library, index) => {
          const rank = index + 1;
          const isHighlighted = rank <= highlightTop;
          const isExpanded = expandedLibrary === library.libraryName;

          return (
            <div
              key={library.libraryName}
              className={`overflow-hidden rounded-xl border transition ${
                isHighlighted
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/10 bg-background/[0.03]'
              }`}
            >
              <button
                onClick={() =>
                  setExpandedLibrary(isExpanded ? null : library.libraryName)
                }
                className="w-full p-4 text-left transition hover:bg-background/[0.03]"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Rank and Library */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        isHighlighted
                          ? 'bg-primary/20 text-cyan-300'
                          : 'bg-background/5 text-foreground/40'
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/5">
                      <LibraryIcon
                        libraryName={library.repo}
                        size={24}
                        className="text-foreground/90"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {library.libraryName}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {library.owner}/{library.repo}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4">
                    {/* Component mini-badges */}
                    <div className="hidden items-center gap-1 lg:flex">
                      <ComponentMiniBadge label="EF" value={library.ef} />
                      <ComponentMiniBadge label="CQ" value={library.cq} />
                      <ComponentMiniBadge label="MH" value={library.mh} />
                    </div>

                    {/* Allocation */}
                    {showAllocation && (
                      <div className="hidden text-right sm:block">
                        <div className="text-xs text-foreground/50">Allocation</div>
                        <div className="text-sm font-semibold text-cyan-400">
                          {formatAllocation(library.allocation_usd)}
                        </div>
                      </div>
                    )}

                    {/* RIS Score */}
                    <div className="text-right">
                      <div className="text-xs text-foreground/50">RIS</div>
                      <div
                        className={`text-xl font-bold ${getRISColorClass(library.ris)}`}
                      >
                        {formatRIS(library.ris)}
                      </div>
                    </div>

                    {/* Expand arrow */}
                    <div className="text-foreground/40">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border/10 bg-background/[0.02] p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <ComponentDetail
                      label="Ecosystem Footprint"
                      code="EF"
                      value={library.ef}
                      details={`${library.raw.npm_downloads.toLocaleString()} downloads, ${library.raw.gh_dependents.toLocaleString()} dependents`}
                    />
                    <ComponentDetail
                      label="Contribution Quality"
                      code="CQ"
                      value={library.cq}
                      details={`${library.raw.unique_contribs} contributors, ${(library.raw.issue_resolution_rate * 100).toFixed(0)}% resolved`}
                    />
                    <ComponentDetail
                      label="Maintainer Health"
                      code="MH"
                      value={library.mh}
                      details={`${library.raw.active_maintainers} maintainers, ${library.raw.release_cadence_days}d cadence`}
                    />
                    <ComponentDetail
                      label="Community Benefit"
                      code="CB"
                      value={library.cb}
                      details={`${(library.raw.docs_completeness * 100).toFixed(0)}% docs, ${library.raw.tutorials_refs} tutorials`}
                    />
                    <ComponentDetail
                      label="Mission Alignment"
                      code="MA"
                      value={library.ma}
                      details={`TypeScript: ${(library.raw.typescript_strictness * 100).toFixed(0)}%, Security: ${(library.raw.security_practices * 100).toFixed(0)}%`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComponentMiniBadge({ label, value }: { label: string; value: number }) {
  return (
    <div
      className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${getComponentColorClass(label)}`}
    >
      <span className="text-xs font-medium">{label}</span>
      <span className="text-xs font-semibold">{(value * 100).toFixed(0)}</span>
    </div>
  );
}

function ComponentDetail({
  label,
  code,
  value,
  details,
}: {
  label: string;
  code: string;
  value: number;
  details: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${getComponentColorClass(code)}`}>
          {code}
        </span>
        <span className="text-xs text-foreground/70">{label}</span>
      </div>
      <div className={`text-lg font-bold ${getRISColorClass(value)}`}>
        {formatRIS(value)}
      </div>
      <div className="mt-1 text-xs text-foreground/50">{details}</div>
    </div>
  );
}

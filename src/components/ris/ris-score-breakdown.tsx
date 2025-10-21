/**
 * RIS Score Breakdown Component
 * Displays detailed breakdown of a library's React Impact Score
 */

import { type LibraryScore } from '@/lib/ris';
import {
  formatRIS,
  formatAllocation,
  getRISColorClass,
  getComponentColorClass,
} from '@/lib/ris';

interface RISScoreBreakdownProps {
  score: LibraryScore;
  showAllocation?: boolean;
  showRawMetrics?: boolean;
}

export function RISScoreBreakdown({
  score,
  showAllocation = true,
  showRawMetrics = false,
}: RISScoreBreakdownProps) {
  const components = [
    {
      key: 'ef',
      label: 'Ecosystem Footprint',
      code: 'EF',
      description: 'How widely used and adopted the library is across the ecosystem',
      weight: 30,
    },
    {
      key: 'cq',
      label: 'Contribution Quality',
      code: 'CQ',
      description: 'Quality and impact of contributions, not just volume',
      weight: 25,
    },
    {
      key: 'mh',
      label: 'Maintainer Health',
      code: 'MH',
      description: 'Sustainability of the maintenance team and processes',
      weight: 20,
    },
    {
      key: 'cb',
      label: 'Community Benefit',
      code: 'CB',
      description: 'Educational value, documentation, and community support',
      weight: 15,
    },
    {
      key: 'ma',
      label: 'Mission Alignment',
      code: 'MA',
      description: "Alignment with React's long-term goals and best practices",
      weight: 10,
    },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Overall RIS Score */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {score.libraryName}
            </h3>
            <p className="text-sm text-white/60">
              {score.owner}/{score.repo}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">React Impact Score</div>
            <div className={`text-3xl font-bold ${getRISColorClass(score.ris)}`}>
              {formatRIS(score.ris)}
            </div>
          </div>
        </div>

        {showAllocation && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-sm text-white/70">Quarterly Allocation</span>
            <div className="text-right">
              <div className="text-xl font-semibold text-cyan-400">
                {formatAllocation(score.allocation_usd)}
              </div>
              {(score.floor_applied || score.cap_applied) && (
                <div className="mt-1 text-xs text-white/50">
                  {score.floor_applied && '(minimum floor applied)'}
                  {score.cap_applied && '(maximum cap applied)'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Component Scores */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
          Component Scores
        </h4>
        <div className="space-y-4">
          {components.map((component) => {
            const value = score[component.key];
            const percentage = value * 100;

            return (
              <div key={component.key}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${getComponentColorClass(component.code)}`}
                    >
                      {component.code}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {component.label}
                    </span>
                    <span className="text-xs text-white/40">
                      ({component.weight}%)
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${getRISColorClass(value)}`}>
                    {formatRIS(value)}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${getComponentBarColor(component.code)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-white/50">
                  {component.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Metrics (Optional) */}
      {showRawMetrics && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/70">
            Key Metrics
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="NPM Downloads (12mo)"
              value={score.raw.npm_downloads.toLocaleString()}
            />
            <MetricCard
              label="GitHub Dependents"
              value={score.raw.gh_dependents.toLocaleString()}
            />
            <MetricCard
              label="Unique Contributors"
              value={score.raw.unique_contribs.toLocaleString()}
            />
            <MetricCard
              label="Active Maintainers"
              value={score.raw.active_maintainers.toString()}
            />
            <MetricCard
              label="Issue Resolution Rate"
              value={`${(score.raw.issue_resolution_rate * 100).toFixed(0)}%`}
            />
            <MetricCard
              label="Docs Completeness"
              value={`${(score.raw.docs_completeness * 100).toFixed(0)}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function getComponentBarColor(component: string): string {
  const colors: Record<string, string> = {
    EF: 'bg-blue-500',
    CQ: 'bg-green-500',
    MH: 'bg-purple-500',
    CB: 'bg-yellow-500',
    MA: 'bg-pink-500',
  };
  return colors[component] || 'bg-gray-500';
}

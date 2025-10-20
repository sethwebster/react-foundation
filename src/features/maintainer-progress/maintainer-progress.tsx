"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";

import { Collapsible } from "@/components/ui/collapsible";
import type { LibraryCategory, MaintainerTier } from "@/lib/maintainer-tiers";
import {
  ecosystemLibraries,
  maintainerTiers,
} from "@/lib/maintainer-tiers";
import { products } from "@/lib/products";

import { useMaintainerProgress } from "./context";
import { UsernameInput } from "./username-input";

const formatter = new Intl.NumberFormat("en-US");

export function MaintainerProgress() {
  const { progress, setProgress } = useMaintainerProgress();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { data: session, status } = useSession();
  const githubLogin = session?.user?.githubLogin ?? null;

  const currentTier: MaintainerTier | null = progress.tier;

  const nextTier = useMemo(() => {
    if (!progress.stats) {
      return maintainerTiers[0];
    }
    const higher = maintainerTiers.find((tier) => tier.minScore > progress.stats!.score);
    return higher ?? null;
  }, [progress.stats]);

  const progressTowardsNext = useMemo(() => {
    if (!progress.stats) {
      return 0;
    }
    if (!nextTier) {
      return 1;
    }
    const lowerBound = currentTier?.minScore ?? 0;
    const span = nextTier.minScore - lowerBound;
    if (span <= 0) {
      return 1;
    }
    return Math.min(1, (progress.stats.score - lowerBound) / span);
  }, [progress.stats, nextTier, currentTier]);

  const fetchProgress = useCallback(
    (username: string) => {
      setError(null);
      startTransition(async () => {
        try {
          const response = await fetch("/api/maintainer/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
          });
          const payload = await response.json();
          if (!response.ok) {
            setError(payload?.error ?? "Unable to fetch contributions.");
            return;
          }
          setProgress({
            stats: payload.stats,
            tier: payload.tier,
            username: payload.username,
          });
        } catch (err) {
          console.error(err);
          setError("Unexpected error checking contributions.");
        }
      });
    },
    [setProgress],
  );

  // Auto-populate from session when logged in
  useEffect(() => {
    if (githubLogin) {
      localStorage.setItem('contributor-username', githubLogin);
      fetchProgress(githubLogin);
    }
  }, [githubLogin, fetchProgress]);

  const reposByCategory = useMemo(() => {
    const grouped = new Map<LibraryCategory, string[]>();
    ecosystemLibraries.forEach((repo) => {
      const repoName = `${repo.owner}/${repo.name}`;
      if (!grouped.has(repo.category)) {
        grouped.set(repo.category, []);
      }
      grouped.get(repo.category)!.push(repoName);
    });
    return grouped;
  }, []);

  const categoryLabels: Record<LibraryCategory, string> = {
    core: "Core React",
    state: "State Management",
    data: "Data Fetching",
    routing: "Routing",
    framework: "Meta-frameworks",
    forms: "Forms & Validation",
    testing: "Testing",
    ui: "UI Libraries",
    animation: "Animation",
    tooling: "Dev Tools",
    styling: "Styling",
    tables: "Data Tables",
  };

  const categoryContributions = useMemo(() => {
    if (!progress.stats?.perRepository) {
      return new Map<LibraryCategory, number>();
    }

    const contributions = new Map<LibraryCategory, number>();

    progress.stats.perRepository.forEach((repo) => {
      const library = ecosystemLibraries.find(
        (lib) => `${lib.owner}/${lib.name}`.toLowerCase() === repo.repository.toLowerCase()
      );

      if (library) {
        const current = contributions.get(library.category) || 0;
        const repoTotal = repo.pullRequests + repo.issues + repo.commits;
        contributions.set(library.category, current + repoTotal);
      }
    });

    return contributions;
  }, [progress.stats]);

  const repoContributionCounts = useMemo(() => {
    if (!progress.stats?.perRepository) {
      return new Map<string, number>();
    }

    const counts = new Map<string, number>();

    progress.stats.perRepository.forEach((repo) => {
      const repoTotal = repo.pullRequests + repo.issues + repo.commits;
      counts.set(repo.repository.toLowerCase(), repoTotal);
    });

    return counts;
  }, [progress.stats]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Ecosystem Contributor Progress</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Link your GitHub account to unlock the Core Maintainer Essentials collection. We
            track contributions to {ecosystemLibraries.length} React ecosystem libraries across state management, data fetching,
            routing, frameworks, testing, styling, and more over the past year.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <UsernameInput
            githubLogin={githubLogin}
            onUsernameChange={fetchProgress}
            isPending={isPending}
          />
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Current tier</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {currentTier?.label ?? "No Tier"}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {currentTier?.description ?? "Start contributing to unlock the Contributor tier and gain access to exclusive products."}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Score</span>
                <span className="font-semibold text-white">
                  {formatter.format(progress.stats?.score ?? 0)}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all"
                  style={{ width: `${Math.round(progressTowardsNext * 100)}%` }}
                />
              </div>
              {nextTier ? (
                <p className="mt-2 text-xs text-white/50">
                  {Math.max(nextTier.minScore - (progress.stats?.score ?? 0), 0)} more points to
                  reach <span className="text-white">{nextTier.label}</span>.
                </p>
              ) : (
                <p className="mt-2 text-xs text-emerald-300">
                  You’ve unlocked every tier of the Core Maintainer Essentials collection.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="PRs Opened" value={progress.stats?.pullRequests ?? 0} />
            <StatCard label="Issues Opened" value={progress.stats?.issues ?? 0} />
            <StatCard label="Commits" value={progress.stats?.commits ?? 0} />
          </div>

          {categoryContributions.size > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Category Breakdown</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Array.from(categoryContributions.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <span className="text-xs text-white/70">{categoryLabels[category]}</span>
                      <span className="text-xs font-semibold text-white">
                        {formatter.format(count)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <Collapsible
              trigger={
                <p className="text-sm font-medium tracking-wide text-white/70">Your Contributions</p>
              }
            >
              <div className="space-y-8">
                {/* Scoring System */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-white/90">Scoring System</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm transition hover:bg-white/[0.07]">
                      <span className="text-sm text-white/80">Pull Requests Opened</span>
                      <span className="text-sm font-semibold tabular-nums text-white">8 pts</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm transition hover:bg-white/[0.07]">
                      <span className="text-sm text-white/80">Issues Opened</span>
                      <span className="text-sm font-semibold tabular-nums text-white">3 pts</span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 backdrop-blur-sm transition hover:bg-white/[0.07]">
                      <span className="text-sm text-white/80">Commits</span>
                      <span className="text-sm font-semibold tabular-nums text-white">1 pt</span>
                    </div>
                  </div>
                </div>

                {/* Tracked Libraries */}
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-white/90">
                    Tracked Libraries
                    <span className="ml-2 text-xs font-normal text-white/50">
                      ({ecosystemLibraries.length})
                    </span>
                  </h3>

                  <div className="space-y-4">
                    {Array.from(reposByCategory.entries())
                      .sort((a, b) => categoryLabels[a[0]].localeCompare(categoryLabels[b[0]]))
                      .map(([category, repos]) => (
                        <div key={category}>
                          <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-white/40">
                            {categoryLabels[category]}
                            <span className="ml-1.5 text-white/30">({repos.length})</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {repos.map((repo) => {
                              const contributionCount = repoContributionCounts.get(repo.toLowerCase());
                              const hasContributions = contributionCount && contributionCount > 0;

                              return (
                                <span
                                  key={repo}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                                    hasContributions
                                      ? "bg-emerald-500/15 text-emerald-200 shadow-sm shadow-emerald-500/10"
                                      : "bg-white/[0.04] text-white/50 hover:bg-white/[0.06]"
                                  }`}
                                >
                                  {repo}
                                  {hasContributions && (
                                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-emerald-500/25 px-1.5 text-[11px] font-semibold tabular-nums text-emerald-100">
                                      {contributionCount}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Collapsible>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Product Unlock Timeline</p>

          {status === "unauthenticated" ? (
            <p className="text-sm text-white/60">
              Link your GitHub account to start unlocking the Core Maintainer Essentials collection.
            </p>
          ) : (
            <div className="space-y-6">
              {maintainerTiers.map((tier) => {
                const tierProducts = products.filter((p) => p.unlockTier === tier.id);
                const isUnlocked = currentTier && maintainerTiers.findIndex((t) => t.id === currentTier.id) >= maintainerTiers.findIndex((t) => t.id === tier.id);

                if (tierProducts.length === 0) return null;

                return (
                  <div key={tier.id}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/10 text-white/40'
                      }`}>
                        {isUnlocked ? '✓' : '🔒'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/90">{tier.label}</p>
                        <p className="text-[10px] text-white/50">{tier.minScore}+ points</p>
                      </div>
                    </div>
                    <ul className="ml-8 space-y-2 border-l-2 border-white/10 pl-4">
                      {tierProducts.map((product) => (
                        <li key={product.slug} className={isUnlocked ? 'opacity-100' : 'opacity-50'}>
                          <span className={`text-sm font-medium ${isUnlocked ? 'text-emerald-200' : 'text-white/60'}`}>
                            {product.name}
                          </span>
                          <span className="block text-xs text-white/40">{product.tagline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{formatter.format(value)}</p>
    </div>
  );
}

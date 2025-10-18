"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";

import type { MaintainerTier } from "@/lib/maintainer-tiers";
import {
  getUnlockedProductsForTier,
  maintainerRepos,
  maintainerTiers,
} from "@/lib/maintainer-tiers";

import { useMaintainerProgress } from "./context";

const formatter = new Intl.NumberFormat("en-US");

export function MaintainerProgress() {
  const { progress, setProgress } = useMaintainerProgress();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { data: session, status } = useSession();
  const githubLogin = session?.user?.githubLogin ?? null;

  const currentTier: MaintainerTier | null = progress.tier;

  const unlockedProducts = useMemo(() => {
    if (!currentTier) {
      return [];
    }
    return getUnlockedProductsForTier(currentTier.id);
  }, [currentTier]);

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

  useEffect(() => {
    if (githubLogin) {
      fetchProgress(githubLogin);
    }
  }, [githubLogin, fetchProgress]);

  const repoList = useMemo(
    () => maintainerRepos.map((repo) => `${repo.owner}/${repo.name}`),
    [],
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Maintainer Progress</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Link your GitHub account to unlock the Core Maintainer Essentials collection. We
            scan the React constellation repositories over the past year and unlock pieces as
            your contributions grow.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {status === "authenticated" && githubLogin ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
                Connected GitHub
              </p>
              <div className="flex items-center justify-between rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white/80">
                <span>{githubLogin}</span>
                <button
                  type="button"
                  onClick={() => fetchProgress(githubLogin)}
                  className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5"
                  disabled={isPending}
                >
                  {isPending ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white/70">
              Sign in with GitHub to track your maintainer contributions and unlock Core Maintainer
              Essentials.
            </p>
          )}
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Current tier</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {currentTier?.label ?? "Contributor Access"}
            </p>
            <p className="mt-1 text-sm text-white/60">
              {currentTier?.description}
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
            <StatCard label="Merged PRs" value={progress.stats?.pullRequests ?? 0} />
            <StatCard label="Issues / Docs" value={progress.stats?.issues ?? 0} />
            <StatCard label="Commits" value={progress.stats?.commits ?? 0} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Tracked Repos</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
              {repoList.map((repo) => (
                <span
                  key={repo}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"
                >
                  {repo}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Unlocked Pieces</p>
          {unlockedProducts.length ? (
            <ul className="space-y-2">
              {unlockedProducts.map((product) => (
                <li key={product.slug}>
                  <span className="font-medium text-white">{product.name}</span>
                  <span className="block text-xs text-white/50">{product.tagline}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-white/60">
              Link your GitHub account to start unlocking the Core Maintainer Essentials collection.
            </p>
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

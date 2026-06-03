const BADGE_CONTAINER_BASE_CLASSES =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all";

export const BADGE_CONTRIBUTED_CLASSES =
  "bg-success/15 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:text-emerald-200";

export const BADGE_MUTED_CLASSES =
  "bg-background/[0.04] text-foreground/50 hover:bg-background/[0.06]";

export const COUNT_CHIP_CLASSES =
  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-success/25 px-1.5 text-[11px] font-semibold tabular-nums text-emerald-800 dark:text-emerald-100";

interface TrackedLibraryBadgeProps {
  repo: string;
  contributionCount: number | undefined;
}

export function TrackedLibraryBadge({ repo, contributionCount }: TrackedLibraryBadgeProps) {
  const hasContributions = contributionCount !== undefined && contributionCount > 0;
  const containerClasses = `${BADGE_CONTAINER_BASE_CLASSES} ${
    hasContributions ? BADGE_CONTRIBUTED_CLASSES : BADGE_MUTED_CLASSES
  }`;

  return (
    <span className={containerClasses}>
      {repo}
      {hasContributions && (
        <span className={COUNT_CHIP_CLASSES}>{contributionCount}</span>
      )}
    </span>
  );
}

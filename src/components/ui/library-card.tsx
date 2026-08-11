import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LibraryIcon } from "@/lib/library-icons";
import { formatRIS, getRISColorClass } from "@/lib/ris";

interface LibraryCardProps {
  owner: string;
  name: string;
  displayName: string;
  delay?: number;
  risScore?: number; // Optional RIS score (0-1)
  showRIS?: boolean; // Whether to display RIS score
}

export function LibraryCard({
  owner,
  name,
  displayName,
  delay = 0,
  risScore,
  showRIS = false,
}: LibraryCardProps) {
  return (
    <ScrollReveal animation="fade-up" delay={delay}>
      <a
        href={`https://github.com/${owner}/${name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block border-t border-border py-4 transition hover:border-border-strong"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-subtle">
              <LibraryIcon libraryName={name} size={22} className="text-muted-foreground transition group-hover:text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground transition group-hover:text-primary">
              {displayName}
            </span>
          </div>
          {showRIS && risScore !== undefined && (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-xs text-foreground/40">RIS</span>
              <span className={`text-sm font-semibold ${getRISColorClass(risScore)}`}>
                {formatRIS(risScore)}
              </span>
            </div>
          )}
        </div>
      </a>
    </ScrollReveal>
  );
}

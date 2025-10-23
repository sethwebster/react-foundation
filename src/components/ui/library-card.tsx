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
        className="group block rounded-xl border border-border/10 bg-background/[0.03] p-4 transition hover:border-cyan-400/30 hover:bg-background/[0.06]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/5">
              <LibraryIcon libraryName={name} size={24} className="text-foreground/90 transition group-hover:text-cyan-300" />
            </div>
            <span className="text-sm font-medium text-foreground/80 transition group-hover:text-foreground">
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

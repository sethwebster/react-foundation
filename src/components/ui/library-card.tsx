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
        className="group block rounded-xl border border-[#EBECF0] bg-white p-4 transition hover:border-[#58C4DC] hover:bg-[#E6F7FF]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F6F7F9]">
              <LibraryIcon libraryName={name} size={24} className="text-[#5E687E] transition group-hover:text-[#087EA4]" />
            </div>
            <span className="text-sm font-medium text-[#404756] transition group-hover:text-[#16181D]">
              {displayName}
            </span>
          </div>
          {showRIS && risScore !== undefined && (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-xs text-[#99A1B3]">RIS</span>
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

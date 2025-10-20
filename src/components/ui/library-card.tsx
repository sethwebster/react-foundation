import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LibraryIcon } from "@/lib/library-icons";

interface LibraryCardProps {
  owner: string;
  name: string;
  displayName: string;
  delay?: number;
}

export function LibraryCard({ owner, name, displayName, delay = 0 }: LibraryCardProps) {
  return (
    <ScrollReveal animation="fade-up" delay={delay}>
      <a
        href={`https://github.com/${owner}/${name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <LibraryIcon libraryName={name} size={24} className="text-white/90 transition group-hover:text-cyan-300" />
          </div>
          <span className="text-sm font-medium text-white/80 transition group-hover:text-white">
            {displayName}
          </span>
        </div>
      </a>
    </ScrollReveal>
  );
}

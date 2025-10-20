import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const toneMap: Record<string, string> = {
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
};

type PillProps = {
  children: ReactNode;
  tone?: keyof typeof toneMap | "custom";
  dotColorClassName?: string;
  className?: string;
};

export function Pill({
  children,
  tone = "emerald",
  dotColorClassName,
  className,
}: PillProps) {
  const dotClass =
    tone === "custom"
      ? dotColorClassName
      : toneMap[tone] ?? toneMap.emerald;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur",
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", dotClass)}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

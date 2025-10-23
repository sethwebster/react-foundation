import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const toneMap: Record<string, string> = {
  emerald: "bg-success",
  sky: "bg-primary",
  rose: "bg-destructive",
  amber: "bg-warning",
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
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-xs uppercase tracking-[0.15em] text-muted-foreground backdrop-blur sm:gap-3 sm:px-4 sm:tracking-[0.3em]",
        className,
      )}
    >
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}

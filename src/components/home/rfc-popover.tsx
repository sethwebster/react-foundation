"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

const RFC_REPOS = [
  {
    label: "React RFCs",
    href: "https://github.com/reactjs/rfcs",
    description: "Core React proposals",
  },
  {
    label: "React Native RFCs",
    href: "https://github.com/react-native-community/discussions-and-proposals",
    description: "React Native proposals",
  },
];

export function RfcPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1.5",
        )}
      >
        View RFCs
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="RFC repositories"
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden",
            "rounded-2xl border border-border bg-background shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100",
          )}
        >
          <ul className="divide-y divide-border">
            {RFC_REPOS.map((repo) => (
              <li key={repo.href}>
                <a
                  href={repo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted"
                >
                  <span>
                    <span className="block font-semibold text-foreground">
                      {repo.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {repo.description}
                    </span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

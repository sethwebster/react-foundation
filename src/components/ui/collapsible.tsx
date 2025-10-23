"use client";

import { useState, type ReactNode } from "react";

interface CollapsibleProps {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left transition hover:opacity-70"
        aria-expanded={isOpen}
      >
        {trigger}
        <span
          className="text-foreground/50 transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)" }}
        >
          ▼
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "2000px" : "0",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

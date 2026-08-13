"use client";

import { CalendarDays, ChevronDown, Download, ExternalLink } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { RFDS } from "@/components/rfds";
import { cn } from "@/lib/cn";

const eventName = "React Foundation Contributors Summit 2026";
const eventLocation = "London, United Kingdom";
const summitUrl = "https://react.foundation/summit";

const googleCalendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: eventName,
  dates: "20261110/20261113",
  details: summitUrl,
  location: eventLocation,
}).toString()}`;

const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
  path: "/calendar/action/compose",
  rru: "addevent",
  subject: eventName,
  startdt: "2026-11-10",
  enddt: "2026-11-13",
  allday: "true",
  body: summitUrl,
  location: eventLocation,
}).toString()}`;

interface SummitCalendarMenuProps {
  className?: string;
  size?: "sm" | "lg";
  variant?: "primary" | "secondary" | "tertiary";
}

export function SummitCalendarMenu({
  className,
  size = "lg",
  variant = "primary",
}: SummitCalendarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <RFDS.Button
        ref={buttonRef}
        type="button"
        variant={variant}
        size={size}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Add to your calendar
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform motion-reduce:transition-none",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </RFDS.Button>

      {isOpen ? (
        <div
          id={menuId}
          aria-label="Calendar options"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-soft"
        >
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Google Calendar
            <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </a>
          <a
            href={outlookCalendarUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Outlook
            <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </a>
          <a
            href="/summit-2026.ics"
            download
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Apple or other calendar
            <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

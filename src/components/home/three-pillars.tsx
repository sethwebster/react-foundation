import type { ReactNode } from "react";

import { ReactAtom } from "@/components/ui/react-atom";

// Scattered "contributor" avatar cloud for the Funding card. Most seats are empty
// (muted placeholders); a handful glow with accent tints. Swap the filled dots for
// real maintainer avatars when available — the scatter/layout is production-ready.
const CLOUD_COLS = 15;
const CLOUD_ROWS = 7;
const CLOUD_TOTAL = CLOUD_COLS * CLOUD_ROWS;
const CLOUD_FILLED = new Map<number, string>([
  [3, "from-primary to-primary/60"],
  [9, "from-success to-success/70"],
  [16, "from-warning to-warning/70"],
  [22, "from-primary to-primary/60"],
  [27, "from-success to-success/70"],
  [34, "from-warning to-warning/70"],
  [38, "from-primary to-primary/60"],
  [45, "from-success to-success/70"],
  [51, "from-warning to-warning/70"],
  [58, "from-primary to-primary/60"],
  [63, "from-success to-success/70"],
  [70, "from-warning to-warning/70"],
  [77, "from-primary to-primary/60"],
  [84, "from-success to-success/70"],
  [91, "from-warning to-warning/70"],
]);

function AvatarCloud() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden md:block"
    >
      <div
        className="absolute right-6 top-1/2 grid -translate-y-1/2 gap-2.5"
        style={{ gridTemplateColumns: `repeat(${CLOUD_COLS}, 2rem)` }}
      >
        {Array.from({ length: CLOUD_TOTAL }).map((_, i) => {
          const tint = CLOUD_FILLED.get(i);
          return tint ? (
            <div
              key={i}
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${tint} shadow-sm`}
            />
          ) : (
            <div
              key={i}
              className="h-8 w-8 rounded-full border border-border/60 bg-muted"
            />
          );
        })}
      </div>
      {/* Fade the cloud into the card so the title + copy stay legible */}
      <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-card via-card to-transparent" />
    </div>
  );
}

function EducationMedia() {
  // Two overlapping, tilted "learning material" tiles — placeholders for the
  // tutorial/workshop photography in the design.
  return (
    <div className="pointer-events-none absolute -bottom-6 left-8 right-8 h-56">
      <div className="absolute bottom-4 left-2 h-40 w-64 -rotate-[7deg] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-warning/15 via-muted to-accent shadow-lg" />
      <div className="absolute bottom-0 left-24 h-40 w-64 rotate-[7deg] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted to-accent shadow-xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <ReactAtom className="h-10 w-10 text-muted-foreground/25" strokeWidth={0.8} />
        </div>
      </div>
    </div>
  );
}

function AccessibilityMedia() {
  // Accessibility mark rising over a "globe" — inclusivity worldwide.
  return (
    <div className="pointer-events-none absolute -bottom-16 left-1/2 h-72 w-72 -translate-x-1/2">
      <div className="absolute inset-x-0 top-14 mx-auto h-72 w-72 rounded-full bg-gradient-to-b from-primary/25 via-primary/10 to-transparent" />
      <svg
        className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        aria-hidden="true"
      >
        <circle cx="12" cy="4" r="1.7" fill="currentColor" stroke="none" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 7.5h17M12 7.5v6m0 0l-3.5 7M12 13.5l3.5 7"
        />
      </svg>
    </div>
  );
}

function PillarCard({
  label,
  accentClass,
  description,
  media,
}: {
  label: string;
  accentClass: string;
  description: string;
  media: ReactNode;
}) {
  return (
    <div className="relative flex h-[420px] flex-col gap-4 overflow-hidden rounded-[2rem] border border-border/60 bg-card p-8 shadow-[0_14px_44px_0_rgba(0,0,0,0.07)] sm:p-10">
      <p className={`text-2xl font-semibold tracking-tight ${accentClass}`}>
        {label}
      </p>
      <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      {media}
    </div>
  );
}

export function ThreePillars() {
  return (
    <section id="pillars" className="scroll-mt-32 space-y-5">
      {/* Funding — full width, avatar cloud */}
      <div className="relative flex h-[420px] flex-col gap-4 overflow-hidden rounded-[2rem] border border-border/60 bg-card p-8 shadow-[0_14px_44px_0_rgba(0,0,0,0.07)] sm:p-10">
        <p className="relative z-10 text-2xl font-semibold tracking-tight text-success">
          Funding
        </p>
        <p className="relative z-10 max-w-sm text-base leading-relaxed text-muted-foreground">
          Direct financial support for the developers maintaining the libraries
          you depend on every day. Maintainers receive funding through multiple
          channels including code contributions, sponsorships, and community
          support.
        </p>
        <AvatarCloud />
      </div>

      {/* Education + Accessibility */}
      <div className="grid gap-5 lg:grid-cols-2">
        <PillarCard
          label="Education"
          accentClass="text-warning"
          description="Supporting tutorials, documentation, workshops, and learning materials that help developers master React and its ecosystem."
          media={<EducationMedia />}
        />
        <PillarCard
          label="Accessibility"
          accentClass="text-primary"
          description="Ensuring React remains accessible and inclusive for developers worldwide, regardless of location, background, or resources."
          media={<AccessibilityMedia />}
        />
      </div>
    </section>
  );
}

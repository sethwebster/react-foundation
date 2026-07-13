import type { ReactNode } from "react";

// Scattered "contributor" avatars for the Funding card. Filled dots use semantic
// accent tints; the rest are empty seats — swap for real avatars when available.
const FILLED = new Set([1, 4, 7, 10, 14, 17, 21, 24, 28, 31, 34]);
const TINTS = [
  "from-primary to-primary/60",
  "from-success to-success/70",
  "from-warning to-warning/70",
];

function AvatarGrid() {
  return (
    <div className="grid grid-cols-8 gap-2.5 sm:grid-cols-12">
      {Array.from({ length: 36 }).map((_, i) =>
        FILLED.has(i) ? (
          <div
            key={i}
            className={`aspect-square rounded-full bg-gradient-to-br ${TINTS[i % TINTS.length]}`}
          />
        ) : (
          <div
            key={i}
            className="aspect-square rounded-full border border-border/60 bg-muted"
          />
        ),
      )}
    </div>
  );
}

function EducationMedia() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted to-accent">
      <svg
        className="h-12 w-12 text-muted-foreground/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.42A12 12 0 0112 21a12 12 0 01-6.16-10.42L12 14z"
        />
      </svg>
    </div>
  );
}

function AccessibilityMedia() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted to-accent">
      <svg
        className="h-14 w-14 text-muted-foreground/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <circle cx="12" cy="4" r="1.6" fill="currentColor" stroke="none" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8h16M12 8v5m0 0l-3.5 6M12 13l3.5 6"
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
    <div className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card p-8">
      <div className="space-y-4">
        <p className={`font-mono text-xs uppercase tracking-[0.18em] ${accentClass}`}>
          {label}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {media}
    </div>
  );
}

export function ThreePillars() {
  return (
    <section id="pillars" className="scroll-mt-32 space-y-6">
      {/* Funding — full width */}
      <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-success">
          Funding
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Direct financial support for the developers maintaining the libraries
          you depend on every day. Maintainers receive funding through multiple
          channels including code contributions, sponsorships, and community
          support.
        </p>
        <div className="mt-8">
          <AvatarGrid />
        </div>
      </div>

      {/* Education + Accessibility */}
      <div className="grid gap-6 lg:grid-cols-2">
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

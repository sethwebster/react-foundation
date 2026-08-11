// Pill = dot + uppercase tracked label. `tone` maps to a semantic dot colour
// (emerald→bg-success, sky→bg-primary, rose→bg-destructive, amber→bg-warning);
// tone="custom" defers to dotColorClassName. Custom-tone usage ported from
// src/app/profile/contributor-status/page.tsx.
import { Pill } from 'storefront';

export const Tones = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Pill tone="emerald">Actively maintained</Pill>
    <Pill tone="sky">RFC in review</Pill>
    <Pill tone="rose">Seeking maintainers</Pill>
    <Pill tone="amber">Funding gap</Pill>
    <Pill tone="custom" dotColorClassName="bg-amber-400">
      Founding member
    </Pill>
  </div>
);

export const InContext = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card p-5">
    <div className="flex flex-wrap items-center gap-3">
      <Pill tone="sky">Drop 004</Pill>
      <Pill tone="emerald">Limited edition</Pill>
    </div>
    <p className="mt-4 text-sm font-semibold text-foreground">
      Hooks &amp; Suspense capsule
    </p>
    <p className="mt-1 text-sm text-muted-foreground">
      Proceeds routed to maintainers of Redux, TanStack Query, and React Router.
    </p>
  </div>
);

export const Truncation = () => (
  <div className="w-full max-w-sm">
    <Pill tone="amber">
      Maintainer health flagged for review by the technical steering committee
    </Pill>
  </div>
);

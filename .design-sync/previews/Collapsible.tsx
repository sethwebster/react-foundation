// Collapsible owns its own open state; `defaultOpen` is the only way to make the
// body statically visible, so Expanded uses it and Collapsed shows the default
// (closed) state — a chevron-only row, which is correct, not truncated.
// Composition ported from src/features/maintainer-progress/maintainer-progress.tsx.
import { Collapsible } from 'storefront';

export const Expanded = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card p-4">
    <Collapsible
      defaultOpen
      trigger={
        <p className="text-sm font-medium text-foreground">Your contributions</p>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="text-sm text-muted-foreground">Pull requests opened</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">8 pts</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="text-sm text-muted-foreground">Issues opened</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">3 pts</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="text-sm text-muted-foreground">Commits</span>
          <span className="text-sm font-semibold tabular-nums text-foreground">1 pt</span>
        </div>
      </div>
    </Collapsible>
  </div>
);

export const Collapsed = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card p-4">
    <Collapsible
      trigger={
        <p className="text-sm font-medium text-foreground">Tracked libraries (54)</p>
      }
    >
      <p className="text-sm text-muted-foreground">
        Redux, TanStack Query, React Router, React Hook Form, and 50 more.
      </p>
    </Collapsible>
  </div>
);

export const StackedFAQ = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card p-4">
    <Collapsible
      defaultOpen
      trigger={
        <p className="text-sm font-medium text-foreground">
          Who is eligible for maintainer funding?
        </p>
      }
    >
      <p className="text-sm leading-relaxed text-muted-foreground">
        Any maintainer of a library indexed by the React Impact Score with an
        active release in the last two quarters.
      </p>
    </Collapsible>
    <div className="mt-4 border-t border-border pt-4">
      <Collapsible
        trigger={
          <p className="text-sm font-medium text-foreground">
            How often are scores recalculated?
          </p>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nightly, from GitHub metrics normalized across the full library set.
        </p>
      </Collapsible>
    </div>
  </div>
);

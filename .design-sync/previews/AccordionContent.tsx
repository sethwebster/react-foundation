// AccordionContent is the animated height wrapper only — it ships no trigger,
// so the owner renders its own header and drives `isOpen` (see
// src/app/profile/layout-client.tsx, which pairs it with a chevron button).
// Both states are static here: Open shows the measured full height, Closed
// collapses to 0px, which is why the closed cell is header-only by design.
import { AccordionContent } from 'storefront';

export const Open = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm font-semibold text-foreground">
        How is the React Impact Score calculated?
      </p>
      <span className="text-muted-foreground" aria-hidden>
        &#9650;
      </span>
    </div>
    <AccordionContent isOpen>
      <div className="space-y-3 px-5 pb-5 text-sm text-muted-foreground">
        <p>
          Five weighted components: ecosystem footprint (30%), contribution
          quality (25%), maintainer health (20%), community benefit (15%), and
          mission alignment (10%).
        </p>
        <p>
          Raw metrics are statistically normalized across all 54 tracked
          libraries before weighting, so a score is always relative to the
          current ecosystem rather than an absolute threshold.
        </p>
      </div>
    </AccordionContent>
  </div>
);

export const Closed = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm font-semibold text-foreground">
        How is the React Impact Score calculated?
      </p>
      <span className="text-muted-foreground" aria-hidden>
        &#9660;
      </span>
    </div>
    <AccordionContent isOpen={false}>
      <div className="space-y-3 px-5 pb-5 text-sm text-muted-foreground">
        <p>
          Five weighted components: ecosystem footprint, contribution quality,
          maintainer health, community benefit, and mission alignment.
        </p>
      </div>
    </AccordionContent>
  </div>
);

export const NavigationDrawer = () => (
  <div className="max-w-sm rounded-2xl border border-border bg-card">
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm font-semibold text-foreground">Maintainer menu</p>
      <span className="text-muted-foreground" aria-hidden>
        &#9650;
      </span>
    </div>
    <AccordionContent isOpen duration={200}>
      <nav className="space-y-2 px-3 pb-4">
        <span className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground">
          Profile
        </span>
        <span className="block rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground">
          Contributor status
        </span>
        <span className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground">
          Tracked repos
        </span>
      </nav>
    </AccordionContent>
  </div>
);

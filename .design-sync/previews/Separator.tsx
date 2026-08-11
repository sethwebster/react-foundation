// Separator is a 1px bg-border rule — invisible on its own, so both cells show
// it doing real work: horizontal between stacked blocks, vertical between
// inline metadata in a fixed-height row (vertical is h-full, so the parent must
// establish the height).
import { Separator } from 'storefront';

export const BetweenSections = () => (
  <div className="max-w-md rounded-2xl border border-border bg-card p-5">
    <p className="text-sm font-semibold text-foreground">React Impact Score</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Ecosystem footprint, contribution quality, and maintainer health, combined.
    </p>
    <Separator className="my-4" />
    <p className="text-sm font-semibold text-foreground">Grant disbursement</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Sponsorship flows routed to maintainers each quarter.
    </p>
    <Separator className="my-4" />
    <p className="text-sm font-semibold text-foreground">Governance</p>
    <p className="mt-1 text-sm text-muted-foreground">
      Reviewed by the technical steering committee.
    </p>
  </div>
);

export const VerticalInline = () => (
  <div className="flex h-6 items-center gap-4 text-sm text-muted-foreground">
    <span>54 libraries</span>
    <Separator orientation="vertical" />
    <span>1,208 contributors</span>
    <Separator orientation="vertical" />
    <span>12 RFCs merged</span>
  </div>
);

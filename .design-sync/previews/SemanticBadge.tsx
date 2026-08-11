// SemanticBadge is a token-coloured pill; an unauthored card showed almost nothing.
// Sweep every variant and then show it in the roles it actually plays in the app.
import { SemanticBadge } from 'storefront';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <SemanticBadge variant="default">Core</SemanticBadge>
    <SemanticBadge variant="secondary">Sustainer</SemanticBadge>
    <SemanticBadge variant="success">Accepted</SemanticBadge>
    <SemanticBadge variant="warning">In review</SemanticBadge>
    <SemanticBadge variant="destructive">Withdrawn</SemanticBadge>
    <SemanticBadge variant="outline">Draft</SemanticBadge>
  </div>
);

export const RFCStatuses = () => (
  <div className="flex flex-col gap-3 text-sm">
    <div className="flex items-center gap-3">
      <span className="w-64 text-foreground">RFC 0042 — View Transitions API</span>
      <SemanticBadge variant="success">Accepted</SemanticBadge>
    </div>
    <div className="flex items-center gap-3">
      <span className="w-64 text-foreground">RFC 0057 — Server Actions in libraries</span>
      <SemanticBadge variant="warning">In review</SemanticBadge>
    </div>
    <div className="flex items-center gap-3">
      <span className="w-64 text-foreground">RFC 0061 — Deprecate legacy context</span>
      <SemanticBadge variant="destructive">Withdrawn</SemanticBadge>
    </div>
    <div className="flex items-center gap-3">
      <span className="w-64 text-foreground">RFC 0063 — Compiler opt-out directive</span>
      <SemanticBadge variant="outline">Draft</SemanticBadge>
    </div>
  </div>
);

export const SponsorshipTiers = () => (
  <div className="flex flex-wrap items-center gap-2">
    <SemanticBadge variant="default">Platinum sponsor</SemanticBadge>
    <SemanticBadge variant="secondary">Gold sponsor</SemanticBadge>
    <SemanticBadge variant="outline">Community backer</SemanticBadge>
    <SemanticBadge variant="success">RIS 92</SemanticBadge>
  </div>
);

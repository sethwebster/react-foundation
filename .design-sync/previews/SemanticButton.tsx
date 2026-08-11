// SemanticButton is a bare <button> with token backgrounds. On its own the floor
// card read near-blank, so sweep the full variant axis + sizes + disabled state.
import { SemanticButton } from 'storefront';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <SemanticButton variant="primary">Become a member</SemanticButton>
    <SemanticButton variant="secondary">View RFC</SemanticButton>
    <SemanticButton variant="success">Approve RFC</SemanticButton>
    <SemanticButton variant="warning">Request changes</SemanticButton>
    <SemanticButton variant="destructive">Withdraw RFC</SemanticButton>
    <SemanticButton variant="ghost">Cancel</SemanticButton>
    <SemanticButton variant="link">Read the charter</SemanticButton>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <SemanticButton variant="primary" size="sm">
      Sponsor
    </SemanticButton>
    <SemanticButton variant="primary" size="md">
      Sponsor React Router
    </SemanticButton>
    <SemanticButton variant="primary" size="lg">
      Sponsor the ecosystem
    </SemanticButton>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <SemanticButton variant="primary">Submit for review</SemanticButton>
    <SemanticButton variant="primary" disabled>
      Submitting&hellip;
    </SemanticButton>
    <SemanticButton variant="secondary" disabled>
      Merge blocked
    </SemanticButton>
    <SemanticButton variant="ghost" disabled>
      Archive
    </SemanticButton>
  </div>
);

// SemanticSeparator is a 1px token-coloured rule. Alone it is invisible, so every
// cell puts it between two blocks of real content.
import { SemanticSeparator, SemanticBadge } from 'storefront';

export const Horizontal = () => (
  <div className="w-full max-w-md">
    <div>
      <h3 className="text-base font-semibold text-foreground">Foundation membership</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Platinum &middot; renewed 14 January 2026
      </p>
    </div>
    <SemanticSeparator className="my-4" />
    <div>
      <h3 className="text-base font-semibold text-foreground">Directed sponsorship</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        react-router, @tanstack/react-query, react-hook-form
      </p>
    </div>
    <SemanticSeparator className="my-4" />
    <div>
      <h3 className="text-base font-semibold text-foreground">Impact statement</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Q2 2026 report published 8 July.
      </p>
    </div>
  </div>
);

export const Vertical = () => (
  <div className="flex h-16 items-center gap-5 text-sm">
    <div>
      <p className="text-muted-foreground">Libraries tracked</p>
      <p className="mt-1 text-lg font-semibold text-foreground">54</p>
    </div>
    <SemanticSeparator orientation="vertical" />
    <div>
      <p className="text-muted-foreground">Maintainers funded</p>
      <p className="mt-1 text-lg font-semibold text-foreground">128</p>
    </div>
    <SemanticSeparator orientation="vertical" />
    <div>
      <p className="text-muted-foreground">Median RIS</p>
      <p className="mt-1 text-lg font-semibold text-foreground">81</p>
    </div>
  </div>
);

export const InListRows = () => (
  <div className="w-full max-w-md">
    {[
      { rfc: 'RFC 0042 — View Transitions API', status: 'Accepted', variant: 'success' as const },
      { rfc: 'RFC 0057 — Server Actions in libraries', status: 'In review', variant: 'warning' as const },
      { rfc: 'RFC 0063 — Compiler opt-out directive', status: 'Draft', variant: 'outline' as const },
    ].map((row, i, all) => (
      <div key={row.rfc}>
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-sm text-foreground">{row.rfc}</span>
          <SemanticBadge variant={row.variant}>{row.status}</SemanticBadge>
        </div>
        {i < all.length - 1 && <SemanticSeparator />}
      </div>
    ))}
  </div>
);

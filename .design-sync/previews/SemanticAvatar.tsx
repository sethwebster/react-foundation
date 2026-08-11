// SemanticAvatar renders `fallback` initials on a muted circle when `src` is absent,
// and a next/image fill image when present. Initials are used here so the card is
// deterministic in the capture browser (no network fetch).
import { SemanticAvatar, SemanticBadge } from 'storefront';

export const Sizes = () => (
  <div className="flex items-end gap-4">
    <div className="flex flex-col items-center gap-2">
      <SemanticAvatar size="sm" fallback="TL" alt="Tanner Linsley" />
      <span className="text-xs text-muted-foreground">sm</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <SemanticAvatar size="md" fallback="ME" alt="Mark Erikson" />
      <span className="text-xs text-muted-foreground">md</span>
    </div>
    <div className="flex flex-col items-center gap-2">
      <SemanticAvatar size="lg" fallback="RF" alt="Ryan Florence" />
      <span className="text-xs text-muted-foreground">lg</span>
    </div>
  </div>
);

export const MaintainerRoster = () => (
  <div className="flex w-full max-w-md flex-col gap-4">
    <div className="flex items-center gap-3">
      <SemanticAvatar size="md" fallback="TL" alt="Tanner Linsley" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Tanner Linsley</p>
        <p className="text-xs text-muted-foreground">@tanstack/react-query &middot; lead maintainer</p>
      </div>
      <SemanticBadge variant="success">Core</SemanticBadge>
    </div>
    <div className="flex items-center gap-3">
      <SemanticAvatar size="md" fallback="ME" alt="Mark Erikson" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Mark Erikson</p>
        <p className="text-xs text-muted-foreground">redux &middot; maintainer</p>
      </div>
      <SemanticBadge variant="secondary">Sustainer</SemanticBadge>
    </div>
    <div className="flex items-center gap-3">
      <SemanticAvatar size="md" fallback="RF" alt="Ryan Florence" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Ryan Florence</p>
        <p className="text-xs text-muted-foreground">react-router &middot; maintainer</p>
      </div>
      <SemanticBadge variant="outline">Contributor</SemanticBadge>
    </div>
  </div>
);

export const StackedGroup = () => (
  <div className="flex items-center gap-3">
    {/* Negative-margin utilities are absent from the compiled Tailwind, so the
        overlap uses an inline style rather than `-ml-3`. */}
    <div className="flex">
      <SemanticAvatar size="md" fallback="TL" alt="Tanner Linsley" className="ring-2 ring-background" />
      <SemanticAvatar size="md" fallback="ME" alt="Mark Erikson" className="ring-2 ring-background" style={{ marginLeft: -8 }} />
      <SemanticAvatar size="md" fallback="RF" alt="Ryan Florence" className="ring-2 ring-background" style={{ marginLeft: -8 }} />
      <SemanticAvatar size="md" fallback="+9" alt="9 more maintainers" className="ring-2 ring-background" style={{ marginLeft: -8 }} />
    </div>
    <span className="text-sm text-muted-foreground">12 maintainers funded this quarter</span>
  </div>
);

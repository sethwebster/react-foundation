// SemanticCard is an unpadded surface — variant only changes background/border/shadow.
// Give it real composed content so the surface treatment is legible.
import { SemanticCard, SemanticBadge, SemanticButton, SemanticSeparator } from 'storefront';

export const Variants = () => (
  <div className="grid w-full max-w-4xl grid-cols-2 gap-4">
    <SemanticCard variant="default" className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">default</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">react-router</h3>
      <p className="mt-1 text-sm text-muted-foreground">Routing for React. 11.2M weekly downloads.</p>
    </SemanticCard>
    <SemanticCard variant="outlined" className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">outlined</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">@tanstack/react-query</h3>
      <p className="mt-1 text-sm text-muted-foreground">Async state management. RIS 94.</p>
    </SemanticCard>
    <SemanticCard variant="elevated" className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">elevated</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">redux</h3>
      <p className="mt-1 text-sm text-muted-foreground">Predictable state container. 4 maintainers.</p>
    </SemanticCard>
    <SemanticCard variant="glass" className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">glass</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">react-hook-form</h3>
      <p className="mt-1 text-sm text-muted-foreground">Performant form validation. RIS 88.</p>
    </SemanticCard>
  </div>
);

export const LibraryImpactCard = () => (
  <SemanticCard variant="outlined" hover className="w-full max-w-md p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-xl font-semibold text-foreground">@tanstack/react-query</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintained by Tanner Linsley and 6 co-maintainers
        </p>
      </div>
      <SemanticBadge variant="success">RIS 94</SemanticBadge>
    </div>

    <SemanticSeparator className="my-4" />

    <dl className="grid grid-cols-3 gap-4 text-sm">
      <div>
        <dt className="text-muted-foreground">Ecosystem</dt>
        <dd className="mt-1 font-semibold text-foreground">96</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Maintainer health</dt>
        <dd className="mt-1 font-semibold text-foreground">89</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Community</dt>
        <dd className="mt-1 font-semibold text-foreground">92</dd>
      </div>
    </dl>

    <div className="mt-6 flex gap-3">
      <SemanticButton variant="primary" size="sm">
        Sponsor this library
      </SemanticButton>
      <SemanticButton variant="ghost" size="sm">
        View impact report
      </SemanticButton>
    </div>
  </SemanticCard>
);

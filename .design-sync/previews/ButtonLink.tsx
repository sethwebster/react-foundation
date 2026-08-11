// ButtonLink is the anchor twin of Button (same buttonVariants()), wrapping
// next/link. `href` is required. Variants/sizes ported from the real API
// contract in src/components/ui/button.tsx — the story file predates `glass`,
// `link` and size `xs`. Canonical pairing ported from src/app/libraries/page.tsx
// and src/components/home/hero.tsx.
import { ButtonLink } from 'storefront';

export const CallToAction = () => (
  <div className="flex flex-wrap items-center gap-3">
    <ButtonLink href="/become-a-member" size="lg">
      Become a member
    </ButtonLink>
    <ButtonLink href="/libraries" variant="secondary" size="lg">
      Browse 54 libraries
    </ButtonLink>
    <ButtonLink href="/impact" variant="ghost" size="lg">
      Read the impact report
    </ButtonLink>
  </div>
);

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <ButtonLink href="/store/collections" variant="primary">
      Primary
    </ButtonLink>
    <ButtonLink href="/scoring" variant="secondary">
      Secondary
    </ButtonLink>
    <ButtonLink href="/rfcs" variant="tertiary">
      Tertiary
    </ButtonLink>
    <ButtonLink href="/updates" variant="glass">
      Glass
    </ButtonLink>
    <ButtonLink href="/about" variant="ghost">
      Ghost
    </ButtonLink>
    <ButtonLink href="/about/board-of-directors" variant="link">
      Link
    </ButtonLink>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <ButtonLink href="/rfcs/0042-react-compiler" size="xs">
      RFC 0042
    </ButtonLink>
    <ButtonLink href="/libraries/tanstack-query" size="sm">
      TanStack Query
    </ButtonLink>
    <ButtonLink href="/libraries/react-router" size="md">
      React Router
    </ButtonLink>
    <ButtonLink href="/communities/start" size="lg">
      Start a community
    </ButtonLink>
  </div>
);

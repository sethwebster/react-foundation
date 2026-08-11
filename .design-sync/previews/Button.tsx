// Ported from stories/Button.stories.tsx, extended to the real API: the story
// file predates the `glass` and `link` variants and the `xs` size, which the
// generated ButtonProps contract shows do exist.
import { Button } from 'storefront';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="tertiary">Tertiary</Button>
    <Button variant="glass">Glass</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="xs">Extra small</Button>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="primary" disabled>
      Primary
    </Button>
    <Button variant="secondary" disabled>
      Secondary
    </Button>
    <Button variant="ghost" disabled>
      Ghost
    </Button>
  </div>
);

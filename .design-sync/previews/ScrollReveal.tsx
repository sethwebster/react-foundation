// ScrollReveal starts at opacity-0 and reveals via IntersectionObserver, then
// runs a 1000ms transition. Every story here is fully inside the capture
// viewport so the observer fires immediately on mount — nothing about the
// animation is disabled. `delay` is left at 0 (a large delay would still be
// mid-transition when the card is photographed).
import { ScrollReveal, SemanticBadge } from 'storefront';

export const RevealedSection = () => (
  <ScrollReveal animation="fade-up">
    <div className="max-w-xl rounded-lg border border-border bg-card p-6">
      <SemanticBadge variant="secondary">2025 Impact Report</SemanticBadge>
      <h3 className="mt-3 text-xl font-semibold text-foreground">
        54 libraries funded, 1,280 maintainers supported
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Every section of the impact report reveals as the reader scrolls, so long-form
        narrative pages arrive one idea at a time instead of all at once.
      </p>
    </div>
  </ScrollReveal>
);

export const Animations = () => (
  <div className="grid grid-cols-2 gap-4">
    {(['fade', 'fade-up', 'fade-down', 'scale', 'slide-left', 'slide-right'] as const).map(
      (animation) => (
        <ScrollReveal key={animation} animation={animation}>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">{animation}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reveals on scroll into view
            </p>
          </div>
        </ScrollReveal>
      )
    )}
  </div>
);

export const StaggeredCards = () => (
  <div className="flex flex-col gap-3">
    {[
      { name: 'TanStack Query', ris: 94 },
      { name: 'React Router', ris: 91 },
      { name: 'Redux Toolkit', ris: 88 },
    ].map((library, i) => (
      <ScrollReveal key={library.name} animation="slide-right" delay={i * 40}>
        <div className="flex max-w-md items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-sm font-medium text-foreground">{library.name}</span>
          <span className="text-sm text-muted-foreground">RIS {library.ris}</span>
        </div>
      </ScrollReveal>
    ))}
  </div>
);

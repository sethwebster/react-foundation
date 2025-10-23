import { ButtonLink } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ThreePillars() {
  return (
    <ScrollReveal animation="scale">
      <section
        id="pillars"
        className="scroll-mt-32 space-y-12 rounded-3xl border border-border/10 bg-muted/60 p-12"
      >
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Three Pillars of Impact
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/60">
            Every contribution supports our three core initiatives
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500">
              <svg
                className="h-8 w-8 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Fund Maintainers
            </h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              Direct financial support for the developers maintaining the libraries
              you depend on every day. Every purchase helps sustain open source.
            </p>
            <div className="pt-4">
              <ButtonLink href="/impact" variant="ghost" size="sm">
                See Impact →
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500">
              <svg
                className="h-8 w-8 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Education & Resources
            </h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              Supporting tutorials, documentation, workshops, and learning materials
              that help developers master React and its ecosystem.
            </p>
            <div className="pt-4">
              <ButtonLink href="/impact" variant="ghost" size="sm">
                Learn More →
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-500">
              <svg
                className="h-8 w-8 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Global Accessibility
            </h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              Ensuring React remains accessible and inclusive for developers worldwide,
              regardless of location, background, or resources.
            </p>
            <div className="pt-4">
              <ButtonLink href="/impact" variant="ghost" size="sm">
                Our Commitment →
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

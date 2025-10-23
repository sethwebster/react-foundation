import { ButtonLink } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function JoinMovementCTA() {
  return (
    <ScrollReveal animation="scale">
      <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-cyan-500/10 via-yellow-400/10 to-orange-500/10 p-12 text-center">
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Join the Movement
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-foreground/70">
          Whether you&apos;re a contributor, maintainer, or React enthusiast, there are
          many ways to support the foundation and help build a sustainable future
          for open source.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/store" variant="primary" size="lg">
            Shop the Store
          </ButtonLink>
          <ButtonLink href="/about" variant="secondary" size="lg">
            Learn More
          </ButtonLink>
          <ButtonLink href="/impact" variant="ghost" size="lg">
            View Impact Reports
          </ButtonLink>
        </div>
      </section>
    </ScrollReveal>
  );
}

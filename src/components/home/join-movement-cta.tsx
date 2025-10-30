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
          Whether you contribute code, organize meetups, create educational content,
          or support financially, there are many ways to participate in building a
          sustainable future for the React ecosystem.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="#contribute" variant="primary" size="lg">
            Get Involved
          </ButtonLink>
          <ButtonLink href="/impact" variant="secondary" size="lg">
            View Impact Reports
          </ButtonLink>
          <ButtonLink href="/store" variant="ghost" size="lg">
            Shop the Store
          </ButtonLink>
        </div>
      </section>
    </ScrollReveal>
  );
}

import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function MissionStatement() {
  return (
    <ScrollReveal animation="fade-up">
      <section
        id="mission"
        className="scroll-mt-32 space-y-6 rounded-3xl border border-border/10 bg-muted/60 p-12"
      >
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Our Mission
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-foreground/70">
          We exist to ensure the React ecosystem thrives for generations to come.
          Through code contributions, community organizing, educational content creation,
          and sustainable funding, we support maintainers, educators, and community
          organizers who build the tools millions of developers rely on.
        </p>
      </section>
    </ScrollReveal>
  );
}

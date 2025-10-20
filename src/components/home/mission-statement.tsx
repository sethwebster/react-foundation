import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function MissionStatement() {
  return (
    <ScrollReveal animation="fade-up">
      <section
        id="mission"
        className="scroll-mt-32 space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-12"
      >
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          Our Mission
        </h2>
        <p className="max-w-3xl text-lg leading-relaxed text-white/70">
          We exist to ensure the React ecosystem thrives for generations to come.
          By creating sustainable funding mechanisms and transparent governance,
          we empower maintainers to build the tools millions of developers rely on.
        </p>
      </section>
    </ScrollReveal>
  );
}

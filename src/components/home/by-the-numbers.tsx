import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function ByTheNumbers() {
  return (
    <ScrollReveal animation="fade-up">
      <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">
          By the Numbers
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="text-5xl font-bold text-white sm:text-6xl">54</div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/60">
              Libraries Supported
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold text-white sm:text-6xl">100%</div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/60">
              Transparency
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold text-white sm:text-6xl">∞</div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/60">
              Community Impact
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}

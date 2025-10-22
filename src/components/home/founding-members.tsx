import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Image from "next/image";

export function FoundingMembers() {
  return (
    <ScrollReveal animation="fade-up">
      <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Founding Members
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70">
            We&apos;re grateful to our founding members who believe in sustaining the
            React ecosystem and supporting open source maintainers.
          </p>
        </div>

        <div className="flex justify-center pt-8">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/10 p-8">
            {/* Blue to charcoal gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-800/60 to-slate-900/80" />

            {/* Radial gradient overlay to blend edges */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 20%, rgba(15, 23, 42, 0.6) 70%, rgba(15, 23, 42, 0.9) 100%)',
              }}
            />

            {/* Dark version works best on gradient background */}
            <div className="relative">
              <Image
                src="/founding-members-dark.webp"
                alt="Founding Members: Amazon, Callstack, Expo, Meta, Microsoft, Software Mansion, and Vercel"
                width={1200}
                height={300}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border/10 pt-8 text-center">
          <p className="text-sm text-foreground/60">
            Interested in becoming a sponsor member?{" "}
            <a
              href="mailto:partnerships@react.foundation"
              className="font-medium text-cyan-400 transition hover:text-cyan-300"
            >
              Contact us
            </a>
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}

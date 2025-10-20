import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";
import { BecomeContributor } from "@/components/home/become-contributor";
import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import { FoundingMembers } from "@/components/home/founding-members";

export const metadata: Metadata = {
  title: "About | React Foundation",
  description: "Learn about the React Foundation's mission, governance, and how we support the ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-30" />
      </div>

      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-1 flex-col gap-20">
          {/* Hero */}
          <section className="space-y-8 pt-12">
            <Pill>Our Story · Our Mission · Our Values</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
                About React Foundation
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-white/70">
                We&apos;re building a sustainable future for the React ecosystem through
                community funding, transparent governance, and unwavering support for
                the maintainers who make it all possible.
              </p>
            </div>
          </section>

          {/* Mission */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Our Mission
              </h2>
              <p className="max-w-3xl text-lg leading-relaxed text-white/70">
                The React Foundation exists to ensure the React ecosystem thrives for
                generations to come. We provide direct financial support to maintainers,
                fund educational initiatives, and ensure accessibility for developers
                worldwide.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Sustainable Funding</h3>
                    <p className="mt-1 text-sm text-white/60">
                      Creating reliable revenue streams that support open source maintainers
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
                    <div className="h-2 w-2 rounded-full bg-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Full Transparency</h3>
                    <p className="mt-1 text-sm text-white/60">
                      Quarterly reports showing exactly how funds are distributed
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                    <div className="h-2 w-2 rounded-full bg-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Community First</h3>
                    <p className="mt-1 text-sm text-white/60">
                      Decisions driven by community needs and maintainer feedback
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* How It Works */}
          <ScrollReveal animation="scale">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                How It Works
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Shop the Store
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Browse our collection of premium React-themed merchandise. Every
                    purchase directly supports the ecosystem.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Revenue Distribution
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    100% of profits are distributed to maintainers of 54+ React ecosystem
                    libraries based on contribution metrics.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Contributor Recognition
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Contributors unlock exclusive merchandise tiers (Contributor, Sustainer,
                    Core) based on their ecosystem contributions.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500">
                    <span className="text-xl font-bold text-white">4</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Transparent Reporting
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Quarterly impact reports detail exactly how funds support maintainers,
                    education, and accessibility initiatives.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Founding Members */}
          <FoundingMembers />

          {/* Ecosystem Libraries */}
          <EcosystemLibraries
            title="Supported Ecosystem"
            description="We track contributions across all 54 critical React ecosystem libraries:"
          />

          {/* Governance */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Transparent Governance
              </h2>
              <p className="max-w-3xl text-lg leading-relaxed text-white/70">
                The React Foundation operates with complete transparency. All funding
                decisions, impact reports, and financial details are published quarterly
                for community review and feedback.
              </p>
              <div className="grid gap-6 pt-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="font-semibold text-white">Open Financials</h3>
                  <p className="text-sm text-white/70">
                    Every dollar tracked and reported publicly
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="font-semibold text-white">Community Input</h3>
                  <p className="text-sm text-white/70">
                    Major decisions informed by maintainer feedback
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="font-semibold text-white">Quarterly Reports</h3>
                  <p className="text-sm text-white/70">
                    Detailed impact metrics published every quarter
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="font-semibold text-white">Open Source Values</h3>
                  <p className="text-sm text-white/70">
                    Built on the same principles as the ecosystem we support
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Become a Contributor */}
          <ScrollReveal animation="scale">
            <BecomeContributor />
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Ready to Make an Impact?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Start supporting the React ecosystem today. Every contribution helps build
                a sustainable future for open source.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ButtonLink href="/store" variant="primary" size="lg">
                  Shop the Store
                </ButtonLink>
                <ButtonLink href="/impact" variant="secondary" size="lg">
                  View Our Impact
                </ButtonLink>
              </div>
            </section>
          </ScrollReveal>
        </main>
      </div>

      <Footer />
    </div>
  );
}

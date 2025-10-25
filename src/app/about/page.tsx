import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";
import { BecomeContributor } from "@/components/home/become-contributor";
import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import { FoundingMembers } from "@/components/home/founding-members";
import { ExecutiveMessage } from "@/components/home/executive-message";

export const metadata: Metadata = {
  title: "About | React Foundation",
  description: "Learn about the React Foundation's mission, governance, and how we support the ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          {/* Hero */}
          <section className="space-y-8 pt-12">
            <Pill>Our Story · Our Mission · Our Values</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                About React Foundation
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-foreground/70">
                We&apos;re building a sustainable future for the React ecosystem through
                community funding, transparent governance, and unwavering support for
                the maintainers who make it all possible.
              </p>
            </div>
          </section>

          {/* Executive Message */}
          <ExecutiveMessage />

          {/* Mission */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Our Mission
              </h2>
              <p className="max-w-3xl text-lg leading-relaxed text-foreground/70">
                The React Foundation exists to ensure the React ecosystem thrives for
                generations to come. We provide direct financial support to maintainers,
                fund educational initiatives, and ensure accessibility for developers
                worldwide.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <div className="h-2 w-2 rounded-full bg-success/50" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Sustainable Funding</h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      Creating reliable revenue streams that support open source maintainers
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary/50" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Full Transparency</h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      Quarterly reports showing exactly how funds are distributed
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <div className="h-2 w-2 rounded-full bg-accent/50" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Community First</h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      Decisions driven by community needs and maintainer feedback
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* How It Works */}
          <ScrollReveal animation="scale">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                How It Works
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                    <span className="text-xl font-bold text-foreground">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Shop the Store
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Browse our collection of premium React-themed merchandise. Every
                    purchase directly supports the ecosystem.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <span className="text-xl font-bold text-foreground">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Revenue Distribution
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    100% of profits are distributed to maintainers of 54+ React ecosystem
                    libraries based on contribution metrics.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-orange-500">
                    <span className="text-xl font-bold text-foreground">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Contributor Recognition
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Contributors unlock exclusive merchandise tiers (Contributor, Sustainer,
                    Core) based on their ecosystem contributions.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500">
                    <span className="text-xl font-bold text-foreground">4</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Transparent Reporting
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
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

          {/* Governance / Communities */}
          <ScrollReveal animation="fade-up">
            <section
              id="communities"
              className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12"
            >
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Transparent Governance
              </h2>
              <p className="max-w-3xl text-lg leading-relaxed text-foreground/70">
                The React Foundation operates with complete transparency. All funding
                decisions, impact reports, and financial details are published quarterly
                for community review and feedback.
              </p>

              {/* Governance Bodies */}
              <div className="grid gap-6 pt-6 lg:grid-cols-2">
                <Link
                  href="/about/board-of-directors"
                  className="group block space-y-4 rounded-2xl border border-border/10 bg-card text-card-foreground p-8 transition-all hover:border-primary/20 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                        Board of Directors
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Strategic Leadership · Financial Oversight · Governance
                      </p>
                    </div>
                    <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Our Board provides strategic guidance, ensures financial oversight, and
                    maintains the foundation&apos;s commitment to transparency and community-first values.
                  </p>
                </Link>

                <Link
                  href="/about/technical-steering-committee"
                  className="group block space-y-4 rounded-2xl border border-border/10 bg-card text-card-foreground p-8 transition-all hover:border-success/20 hover:bg-gradient-to-br hover:from-success/5 hover:to-primary/5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg">
                      <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-success">
                        Technical Steering Committee
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Technical Excellence · Innovation · Open Standards
                      </p>
                    </div>
                    <svg className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    The TSC drives technical excellence across the React ecosystem, establishing
                    standards, best practices, and supporting innovation in libraries and tools.
                  </p>
                </Link>
              </div>

              {/* Governance Principles */}
              <div className="grid gap-6 pt-6 sm:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/[0.03] p-6">
                  <h3 className="font-semibold text-foreground">Open Financials</h3>
                  <p className="text-sm text-foreground/70">
                    Every dollar tracked and reported publicly
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/[0.03] p-6">
                  <h3 className="font-semibold text-foreground">Community Input</h3>
                  <p className="text-sm text-foreground/70">
                    Major decisions informed by maintainer feedback
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/[0.03] p-6">
                  <h3 className="font-semibold text-foreground">Quarterly Reports</h3>
                  <p className="text-sm text-foreground/70">
                    Detailed impact metrics published every quarter
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/[0.03] p-6">
                  <h3 className="font-semibold text-foreground">Open Source Values</h3>
                  <p className="text-sm text-foreground/70">
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
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-cyan-500/10 via-yellow-400/10 to-orange-500/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Ready to Make an Impact?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-foreground/70">
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

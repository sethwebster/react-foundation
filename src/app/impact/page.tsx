import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";
import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";

export const metadata: Metadata = {
  title: "Impact Reports | React Foundation",
  description: "See how React Foundation funding supports the ecosystem with transparent quarterly reports.",
};

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          {/* Hero */}
          <section className="space-y-8 pt-12">
            <Pill>100% Transparent · Quarterly Reports · Real Impact</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Our Impact
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-foreground/70">
                Full transparency on how your support funds the React ecosystem. Every
                contribution is tracked and reported publicly.
              </p>
            </div>
          </section>

          {/* Coming Soon */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 p-12">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                  <svg
                    className="h-10 w-10 text-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  First Report Coming Soon
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70">
                  Our inaugural quarterly impact report will be published once the store
                  launches. Each report will provide complete transparency into fund
                  distribution.
                </p>
              </div>

              <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">💰</div>
                  <h3 className="font-semibold text-foreground">Revenue Details</h3>
                  <p className="text-sm text-foreground/60">
                    Total revenue generated from all sources
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">👥</div>
                  <h3 className="font-semibold text-foreground">Maintainer Funding</h3>
                  <p className="text-sm text-foreground/60">
                    Breakdown of funding by library and maintainer
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">📚</div>
                  <h3 className="font-semibold text-foreground">Education Initiatives</h3>
                  <p className="text-sm text-foreground/60">
                    Tutorials, docs, and learning resources supported
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">🌍</div>
                  <h3 className="font-semibold text-foreground">Accessibility</h3>
                  <p className="text-sm text-foreground/60">
                    Global accessibility improvements funded
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">📊</div>
                  <h3 className="font-semibold text-foreground">Impact Metrics</h3>
                  <p className="text-sm text-foreground/60">
                    Downloads, usage, and ecosystem growth data
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/[0.03] p-6 text-center">
                  <div className="text-2xl">💬</div>
                  <h3 className="font-semibold text-foreground">Community Feedback</h3>
                  <p className="text-sm text-foreground/60">
                    Testimonials from maintainers and contributors
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Ecosystem Libraries */}
          <EcosystemLibraries
            id="libraries"
            title="Supported Ecosystem"
            description="We track contributions across all 54 critical React ecosystem libraries, ensuring fair distribution of funds based on contribution metrics."
          />

          {/* How Funds are Distributed */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                How Funds are Distributed
              </h2>
              <p className="max-w-3xl text-lg text-foreground/70">
                We use a transparent, metrics-based approach to ensure fair distribution
                of funds to maintainers across the React ecosystem.
              </p>

              <div className="grid gap-6 pt-6 lg:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <span className="text-2xl font-bold text-foreground">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Contribution Tracking
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    We track pull requests, issues, and commits across all 54 supported
                    libraries using GitHub&apos;s GraphQL API.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500">
                    <span className="text-2xl font-bold text-foreground">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Score Calculation</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Contributions are weighted (PRs × 8 + Issues × 3 + Commits × 1) to
                    calculate fair distribution ratios.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-orange-500">
                    <span className="text-2xl font-bold text-foreground">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Fund Distribution</h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    100% of profits are distributed quarterly based on contribution scores
                    and library impact metrics.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal animation="scale">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-cyan-500/10 via-yellow-400/10 to-orange-500/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Support the Ecosystem
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-foreground/70">
                Every purchase directly supports React ecosystem maintainers. Shop the
                store to make an impact today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <ButtonLink href="/store" variant="primary" size="lg">
                  Shop the Store
                </ButtonLink>
                <ButtonLink href="/about" variant="secondary" size="lg">
                  Learn More
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

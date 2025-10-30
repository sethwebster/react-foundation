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
import { RFDS } from "@/components/rfds";

const sections = [
  { id: 'executive-message', title: 'Executive Message', level: 1 as const },
  { id: 'mission', title: 'Our Mission', level: 1 as const },
  { id: 'how-it-works', title: 'How It Works', level: 1 as const },
  { id: 'founding-members', title: 'Founding Members', level: 1 as const },
  { id: 'supported-ecosystem', title: 'Supported Ecosystem', level: 1 as const },
  { id: 'governance', title: 'Transparent Governance', level: 1 as const },
  { id: 'become-contributor', title: 'Become a Contributor', level: 1 as const },
];

export const metadata: Metadata = {
  title: "About | React Foundation",
  description: "Learn about the React Foundation's mission, governance, and how we support the ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-success/50 via-primary/60 to-primary/70 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
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
          <div id="executive-message">
            <ExecutiveMessage />
          </div>

          {/* Mission */}
          <div id="mission">
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
          </div>

          {/* How It Works */}
          <div id="how-it-works">
          <ScrollReveal animation="scale">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                How It Works
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
                    <span className="text-xl font-bold text-primary-foreground">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Contribute to the Ecosystem
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Submit code, documentation, RFCs, and bug reports to React and 54+
                    ecosystem libraries. Your contributions directly improve the tools
                    millions of developers use every day.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-success to-primary">
                    <span className="text-xl font-bold text-success-foreground">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Join the Community
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Organize meetups, create educational content, teach workshops, or
                    help other developers learn React. Community organizers and educators
                    are essential to ecosystem growth.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Support Through the Store
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    One way to fund the ecosystem is through our official merchandise store.
                    100% of profits support maintainers, educators, and community organizers
                    based on transparent impact metrics.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-accent">
                    <span className="text-xl font-bold text-primary-foreground">4</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Transparent Impact
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Quarterly impact reports detail exactly how funds support maintainers,
                    education, and accessibility initiatives. Full transparency in how
                    contributions make a difference.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>
          </div>

          {/* Founding Members */}
          <div id="founding-members">
            <FoundingMembers />
          </div>

          {/* Ecosystem Libraries */}
          <div id="supported-ecosystem">
            <EcosystemLibraries
              title="Supported Ecosystem"
            />
          </div>

          {/* Governance / Communities */}
          <div id="governance">
          <ScrollReveal animation="fade-up">
            <section
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
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <svg className="h-7 w-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-success to-primary shadow-lg">
                      <svg className="h-7 w-7 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>

          {/* Become a Contributor */}
          <div id="become-contributor">
          <ScrollReveal animation="scale">
            <BecomeContributor />
          </ScrollReveal>
          </div>

          {/* CTA */}
          <ScrollReveal animation="fade-up">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-primary/10 via-warning/10 to-warning/5 p-12 text-center">
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

        {/* Table of Contents Sidebar */}
        <RFDS.TableOfContents sections={sections} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

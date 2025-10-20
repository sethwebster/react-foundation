import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";
import { BecomeContributor } from "@/components/home/become-contributor";

export const metadata: Metadata = {
  title: "React Foundation",
  description: "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 pt-24 text-slate-100">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center overflow-hidden blur-3xl">
        <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-1 flex-col gap-20">
          {/* Hero Section */}
          <section className="space-y-8 pt-12">
            <Pill>Community-Driven · Transparent · Impactful</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">
                Building the future of React, together.
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-white/70">
                The React Foundation is a community-driven initiative dedicated to sustaining
                and advancing the React ecosystem by funding maintainers, supporting education,
                and ensuring accessibility for all developers.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/store" variant="primary" size="lg">
                Shop to Support
              </ButtonLink>
              <ButtonLink href="#contribute" variant="tertiary" size="lg">
                Contribute
              </ButtonLink>
              <ButtonLink href="/about" variant="secondary" size="lg">
                Learn Our Story
              </ButtonLink>
            </div>
            <div className="flex flex-col gap-4 text-xs uppercase tracking-[0.2em] text-white/50 sm:flex-row sm:items-center sm:gap-6 sm:tracking-[0.25em]">
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 shrink-0 bg-emerald-400" />
                <span className="whitespace-nowrap">100% Transparent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 shrink-0 bg-sky-400" />
                <span className="whitespace-nowrap">Community First</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 shrink-0 bg-rose-400" />
                <span className="whitespace-nowrap">Open Source</span>
              </div>
            </div>
          </section>

          {/* Mission Statement */}
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

          {/* Three Pillars */}
          <ScrollReveal animation="scale">
            <section
              id="pillars"
              className="scroll-mt-32 space-y-12 rounded-3xl border border-white/10 bg-slate-900/60 p-12"
            >
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Three Pillars of Impact
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
                  Every contribution supports our three core initiatives
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Fund Maintainers
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Direct financial support for the developers maintaining the libraries
                    you depend on every day. Every purchase helps sustain open source.
                  </p>
                  <div className="pt-4">
                    <ButtonLink href="/impact" variant="ghost" size="sm">
                      See Impact →
                    </ButtonLink>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Education & Resources
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Supporting tutorials, documentation, workshops, and learning materials
                    that help developers master React and its ecosystem.
                  </p>
                  <div className="pt-4">
                    <ButtonLink href="/impact" variant="ghost" size="sm">
                      Learn More →
                    </ButtonLink>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Global Accessibility
                  </h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    Ensuring React remains accessible and inclusive for developers worldwide,
                    regardless of location, background, or resources.
                  </p>
                  <div className="pt-4">
                    <ButtonLink href="/impact" variant="ghost" size="sm">
                      Our Commitment →
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Stats Section */}
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

          {/* Become a Contributor */}
          <ScrollReveal animation="scale">
            <BecomeContributor />
          </ScrollReveal>

          {/* CTA Section */}
          <ScrollReveal animation="scale">
            <section className="scroll-mt-32 space-y-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Join the Movement
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-white/70">
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
        </main>
      </div>

      <Footer />
    </div>
  );
}

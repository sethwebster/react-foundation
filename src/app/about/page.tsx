import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { BecomeContributor } from "@/components/home/become-contributor";
import { ExecutiveMessage } from "@/components/home/executive-message";

export const metadata: Metadata = {
  title: "About | React Foundation",
  description:
    "Learn about the React Foundation's mission, governance, and how we support the ecosystem.",
};

const MISSION = [
  {
    title: "Sustainable Funding",
    description:
      "Creating reliable revenue streams that support open source maintainers.",
    accent: "text-success",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Full Transparency",
    description: "Quarterly reports showing exactly how funds are distributed.",
    accent: "text-primary",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    title: "Community First",
    description: "Decisions driven by community needs and maintainer feedback.",
    accent: "text-destructive",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.9 7.9 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
];

const STEPS = [
  {
    title: "Contribute to the Ecosystem",
    description:
      "Submit code, documentation, RFCs, and bug reports to React and 54+ ecosystem libraries. Your contributions directly improve the tools millions of developers use every day.",
  },
  {
    title: "Join the Community",
    description:
      "Organize meetups, create educational content, teach workshops, or help other developers learn React. Community organizers and educators are essential to ecosystem growth.",
  },
  {
    title: "Support Through the Store",
    description:
      "One way to fund the ecosystem is through our official merchandise store. 100% of profits support maintainers, educators, and community organizers based on transparent impact metrics.",
  },
  {
    title: "Transparent Impact",
    description:
      "Quarterly impact reports detail exactly how funds support maintainers, education, and accessibility initiatives. Full transparency in how contributions make a difference.",
  },
];

const GOVERNANCE = [
  {
    href: "/about/board-of-directors",
    title: "Board of Directors",
    eyebrow: "Strategic Leadership · Financial Oversight · Governance",
    description:
      "Our Board provides strategic guidance, ensures financial oversight, and maintains the foundation's commitment to transparency and community-first values.",
  },
  {
    href: "/about/technical-steering-committee",
    title: "Technical Steering Committee",
    eyebrow: "Technical Excellence · Innovation · Open Standards",
    description:
      "The TSC drives technical excellence across the React ecosystem, establishing standards, best practices, and supporting innovation in libraries and tools.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative bg-background pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-muted/70 to-background" />

      <div className="animate-page-appear mx-auto max-w-4xl px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-24">
          {/* Hero */}
          <section className="pt-10 text-center sm:pt-14">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              About The React Foundation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              We&apos;re building a sustainable future for the React ecosystem
              through community funding, transparent governance, and unwavering
              support for the maintainers who make it all possible.
            </p>
          </section>

          <ExecutiveMessage />

          {/* Mission */}
          <section className="scroll-mt-32">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Our Mission
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                The React Foundation exists to ensure the React ecosystem thrives
                for generations to come. We provide direct financial support to
                maintainers, fund educational initiatives, and ensure
                accessibility for developers worldwide.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {MISSION.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-border/60 bg-card p-6"
                >
                  <svg
                    className={`h-6 w-6 ${item.accent}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="scroll-mt-32">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <ol className="mt-12 divide-y divide-border/60">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-6 py-6 first:pt-0">
                  <span className="pt-0.5 font-mono text-sm text-muted-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Governance */}
          <section className="scroll-mt-32">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Transparent Governance
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                All funding decisions, impact reports, and financial details are
                published quarterly for community review and feedback.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {GOVERNANCE.map((body) => (
                <Link
                  key={body.href}
                  href={body.href}
                  className="group rounded-3xl border border-border/60 bg-card p-8 transition-colors hover:border-primary/40"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {body.eyebrow}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {body.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {body.description}
                  </p>
                  <span className="mt-6 inline-block text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                    Learn more →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <BecomeContributor />

          {/* CTA */}
          <section className="flex flex-col items-center gap-6 py-4 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ready to Make an Impact?
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Start supporting the React ecosystem today. Every contribution helps
              build a sustainable future for open source.
            </p>
            <ButtonLink href="/become-a-member" variant="primary" size="lg">
              Get involved
            </ButtonLink>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

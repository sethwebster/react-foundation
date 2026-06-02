import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";

const ENROLLMENT_URL =
  "https://enrollment.lfx.linuxfoundation.org/?project=react-foundation";

const sponsorReasons = [
  {
    title: "Sustain core infrastructure",
    description:
      "Help fund the maintainers, tooling, and shared services that millions of developers and teams rely on every day.",
  },
  {
    title: "Invest in ecosystem health",
    description:
      "Support programs that strengthen libraries, education, security, accessibility, and long-term project resilience.",
  },
  {
    title: "Shape responsible growth",
    description:
      "Join a member community aligned around transparent governance and a healthy future for React across companies and communities.",
  },
];

const membershipBenefits = [
  "Visible support for React's independent ecosystem stewardship",
  "Participation in foundation member conversations and priorities",
  "Opportunities to collaborate on ecosystem sustainability programs",
  "Connection with maintainers, educators, tool authors, and platform teams",
];

const investmentAreas = [
  "Maintainer support",
  "Community education",
  "Ecosystem tooling",
  "Governance operations",
  "Accessibility and inclusion",
  "Long-term project resilience",
];

export const metadata: Metadata = {
  title: "Become a Sponsor | React Foundation",
  description:
    "Sponsor the React Foundation and help sustain the ecosystem, maintainers, and community programs that support React's future.",
};

export default function BecomeSponsorPage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center overflow-hidden blur-3xl">
        <div className="h-[24rem] w-full max-w-[60rem] bg-gradient-to-r from-success/40 via-primary/60 to-warning/40 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          <section className="grid gap-10 pt-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                  Help sustain the future of React.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-foreground/70">
                  React is more than a library. It is an ecosystem of maintainers,
                  educators, tools, frameworks, and community spaces that help teams
                  build for the web and beyond. Sponsor members help keep that
                  ecosystem healthy, independent, and durable.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <ButtonLink href={ENROLLMENT_URL} size="lg">
                  Join as a sponsor member
                </ButtonLink>
                <ButtonLink href="#membership" variant="secondary" size="lg">
                  See what sponsorship supports
                </ButtonLink>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Direct enrollment
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">
                Ready to join?
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Enrollment is handled through the Linux Foundation. The form opens
                with React Foundation selected so your organization can begin the
                sponsor membership process directly.
              </p>
              <ButtonLink href={ENROLLMENT_URL} className="mt-6 w-full" size="lg">
                Open enrollment form
              </ButtonLink>
            </aside>
          </section>

          <ScrollReveal animation="fade-up">
            <section id="membership" className="space-y-8 scroll-mt-32">
              <div className="max-w-3xl space-y-4">
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  Sponsor members fund the shared work behind React.
                </h2>
                <p className="text-base leading-7 text-foreground/70">
                  Your support helps the foundation invest where individual projects
                  and volunteer maintainers should not have to carry the burden alone.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {sponsorReasons.map((reason) => (
                  <article
                    key={reason.title}
                    className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/5"
                  >
                    <h3 className="text-xl font-semibold text-foreground">
                      {reason.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {reason.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <section className="grid gap-8 rounded-3xl border border-border bg-muted/40 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
              <div className="space-y-4">
                <Pill tone="amber">Member Value</Pill>
                <h2 className="text-3xl font-semibold text-foreground">
                  Built for organizations that depend on React.
                </h2>
                <p className="text-base leading-7 text-foreground/70">
                  Sponsorship is for companies, platforms, agencies, and teams who
                  want React to remain a strong open ecosystem with clear stewardship
                  and practical support for the people doing the work.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {membershipBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-2xl border border-border bg-background p-5 text-sm leading-6 text-foreground/80"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  Practical support for a broad ecosystem.
                </h2>
                <p className="text-base leading-7 text-foreground/70">
                  React Foundation sponsorship helps create capacity for work that
                  benefits the whole ecosystem, not just one product roadmap or one
                  organization&apos;s priorities.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {investmentAreas.map((area) => (
                  <div
                    key={area}
                    className="rounded-2xl border border-border bg-card px-5 py-4 font-medium text-foreground"
                  >
                    {area}
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-success/10 to-warning/15 p-8 text-center sm:p-12">
              <Pill className="mx-auto">Start Sponsorship</Pill>
              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold text-foreground sm:text-4xl">
                Join the organizations helping React stay healthy for everyone.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/70">
                Begin with the Linux Foundation enrollment form, or return to the
                foundation site to learn more about our mission and governance.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <ButtonLink href={ENROLLMENT_URL} size="lg">
                  Join now
                </ButtonLink>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-primary transition hover:text-primary/80"
                >
                  Learn about the foundation
                </Link>
              </div>
            </section>
          </ScrollReveal>
        </main>
      </div>

      <Footer />
    </div>
  );
}

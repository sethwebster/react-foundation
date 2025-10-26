import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Board of Directors | React Foundation",
  description: "Meet the Board of Directors guiding the React Foundation's mission and strategic vision.",
};

interface BoardMember {
  name: string;
  title: string;
  role: string;
  bio: string;
  expertise: string[];
}

const boardMembers: BoardMember[] = [
  {
    name: "To Be Announced",
    title: "Board Chair",
    role: "Strategic Leadership",
    bio: "Leading the React Foundation's vision and strategic direction, ensuring sustainable growth and impact across the React ecosystem.",
    expertise: ["Strategic Planning", "Governance", "Open Source Leadership"],
  },
  {
    name: "To Be Announced",
    title: "Vice Chair",
    role: "Community Relations",
    bio: "Fostering relationships with the global React community and ensuring diverse voices are heard in our decision-making processes.",
    expertise: ["Community Building", "Stakeholder Engagement", "Global Outreach"],
  },
  {
    name: "To Be Announced",
    title: "Treasurer",
    role: "Financial Oversight",
    bio: "Managing the foundation's financial health and ensuring transparent, responsible distribution of funds to maintainers and initiatives.",
    expertise: ["Financial Management", "Audit Compliance", "Fund Distribution"],
  },
  {
    name: "To Be Announced",
    title: "Secretary",
    role: "Governance & Compliance",
    bio: "Maintaining governance standards and ensuring the foundation operates with complete transparency and accountability.",
    expertise: ["Corporate Governance", "Legal Compliance", "Documentation"],
  },
  {
    name: "To Be Announced",
    title: "Director",
    role: "Ecosystem Development",
    bio: "Identifying and supporting critical ecosystem projects, ensuring the React community has the tools and resources needed to thrive.",
    expertise: ["Ecosystem Strategy", "Project Evaluation", "Developer Relations"],
  },
  {
    name: "To Be Announced",
    title: "Director",
    role: "Education & Accessibility",
    bio: "Championing educational initiatives and ensuring React is accessible to developers worldwide, regardless of background or location.",
    expertise: ["Education Programs", "Accessibility", "Diversity & Inclusion"],
  },
];

export default function BoardOfDirectorsPage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      {/* Hero Gradient */}
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-primary/50 via-primary/70 to-accent/60 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          {/* Hero Section */}
          <section className="space-y-8 pt-12">
            <Pill>Governance · Leadership · Transparency</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Board of Directors
              </h1>
              <p className="mt-8 max-w-3xl text-lg text-foreground/70">
                Our Board of Directors provides strategic guidance, ensures financial oversight,
                and maintains the foundation&apos;s commitment to transparency and community-first values.
              </p>
            </div>
          </section>

          {/* Mission Statement */}
          <ScrollReveal animation="fade-up">
            <section className="rounded-3xl border border-border/10 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Our Governance Philosophy
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/70">
                The React Foundation operates with complete transparency and community accountability.
                Our Board ensures that every decision serves the ecosystem&apos;s best interests, with
                quarterly reports, open financials, and active community feedback loops.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Transparent</h3>
                  <p className="text-sm text-foreground/60">
                    All decisions and finances publicly documented
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <div className="h-2 w-2 rounded-full bg-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">Accountable</h3>
                  <p className="text-sm text-foreground/60">
                    Regular reporting and community oversight
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">Community-First</h3>
                  <p className="text-sm text-foreground/60">
                    Decisions guided by ecosystem needs
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Board Members Grid */}
          <ScrollReveal animation="scale">
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  Meet the Board
                </h2>
                <p className="mt-4 text-lg text-foreground/60">
                  Leaders committed to building a sustainable future for React
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {boardMembers.map((member) => (
                  <div
                    key={member.title}
                    className="group relative overflow-hidden rounded-3xl border border-border/10 bg-card transition-all hover:border-primary/20 hover:shadow-lg"
                  >
                    {/* Card Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative p-8">
                      {/* Headshot Placeholder */}
                      <div className="mb-6 flex justify-center">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-border/20 bg-gradient-to-br from-muted to-muted/50">
                          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
                            <svg
                              className="h-16 w-16 text-muted-foreground/40"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Member Info */}
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-primary">
                          {member.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>

                      {/* Bio */}
                      <p className="mt-6 text-sm leading-relaxed text-foreground/70">
                        {member.bio}
                      </p>

                      {/* Expertise Tags */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {member.expertise.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-foreground/80"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Responsibilities */}
          <ScrollReveal animation="fade-up">
            <section className="space-y-8 rounded-3xl border border-border/10 bg-muted/60 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Board Responsibilities
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
                    <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Strategic Direction
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Setting long-term goals, priorities, and initiatives that serve the
                    React ecosystem&apos;s growth and sustainability.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-success to-primary">
                    <svg className="h-6 w-6 text-success-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Financial Oversight
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Ensuring responsible fund management, transparent distribution to maintainers,
                    and regular financial reporting.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-warning/80">
                    <svg className="h-6 w-6 text-warning-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Community Engagement
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Maintaining open dialogue with maintainers, contributors, and the broader
                    React community to inform decisions.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-accent">
                    <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Governance & Compliance
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Establishing policies, ensuring legal compliance, and maintaining the
                    foundation&apos;s integrity and mission alignment.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* CTA Section */}
          <ScrollReveal animation="fade-up">
            <section className="rounded-3xl border border-border/10 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Learn More About Our Governance
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
                Explore our transparent operations, quarterly reports, and how we&apos;re
                building a sustainable future for the React ecosystem.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <ButtonLink href="/about" variant="secondary" size="lg">
                  About the Foundation
                </ButtonLink>
                <ButtonLink href="/impact" variant="primary" size="lg">
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

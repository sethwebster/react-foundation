import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Technical Steering Committee | React Foundation",
  description: "Meet the Technical Steering Committee driving technical excellence and innovation in the React ecosystem.",
};

interface CommitteeMember {
  name: string;
  title: string;
  role: string;
  bio: string;
  expertise: string[];
}

const committeeMembers: CommitteeMember[] = [
  {
    name: "To Be Announced",
    title: "TSC Chair",
    role: "Technical Leadership",
    bio: "Leading technical strategy and architectural decisions, ensuring the React ecosystem maintains excellence and innovation at its core.",
    expertise: ["Architecture", "Technical Strategy", "Open Source Governance"],
  },
  {
    name: "To Be Announced",
    title: "Core Framework Representative",
    role: "React Core Development",
    bio: "Representing React core team perspectives, ensuring alignment between foundation initiatives and React's technical direction.",
    expertise: ["React Internals", "Performance", "Developer Experience"],
  },
  {
    name: "To Be Announced",
    title: "Ecosystem Representative",
    role: "Library Maintainer Relations",
    bio: "Bridging the foundation with ecosystem library maintainers, identifying technical needs and collaboration opportunities.",
    expertise: ["Library Design", "API Standards", "Community Building"],
  },
  {
    name: "To Be Announced",
    title: "Infrastructure Representative",
    role: "Tooling & Build Systems",
    bio: "Overseeing infrastructure, tooling, and build system support across the React ecosystem to enhance developer productivity.",
    expertise: ["Build Tools", "CI/CD", "Developer Tooling"],
  },
  {
    name: "To Be Announced",
    title: "Documentation Representative",
    role: "Educational Content & Best Practices",
    bio: "Championing comprehensive documentation, educational resources, and establishing best practices for the React community.",
    expertise: ["Technical Writing", "Education", "Content Strategy"],
  },
  {
    name: "To Be Announced",
    title: "Security Representative",
    role: "Security & Compliance",
    bio: "Ensuring security best practices, vulnerability management, and compliance standards across supported ecosystem projects.",
    expertise: ["Application Security", "Vulnerability Assessment", "Compliance"],
  },
  {
    name: "To Be Announced",
    title: "Innovation Representative",
    role: "Emerging Technologies",
    bio: "Exploring and evaluating emerging technologies, experimental features, and future directions for the React ecosystem.",
    expertise: ["Research", "Emerging Tech", "Innovation Strategy"],
  },
  {
    name: "To Be Announced",
    title: "Testing Representative",
    role: "Quality Assurance & Testing",
    bio: "Establishing testing standards, quality benchmarks, and supporting testing infrastructure for ecosystem libraries.",
    expertise: ["Testing Frameworks", "Quality Assurance", "Automation"],
  },
];

export default function TechnicalSteeringCommitteePage() {
  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      {/* Hero Gradient */}
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          {/* Hero Section */}
          <section className="space-y-8 pt-12">
            <Pill>Technical Excellence · Innovation · Open Standards</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Technical Steering Committee
              </h1>
              <p className="mt-8 max-w-3xl text-lg text-foreground/70">
                Our Technical Steering Committee (TSC) drives technical excellence across the
                React ecosystem, establishing standards, best practices, and supporting innovation
                in libraries, tools, and frameworks.
              </p>
            </div>
          </section>

          {/* Mission Statement */}
          <ScrollReveal animation="fade-up">
            <section className="rounded-3xl border border-border/10 bg-gradient-to-br from-success/5 via-primary/5 to-accent/5 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Our Technical Mission
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/70">
                The TSC ensures technical decisions align with the ecosystem&apos;s long-term health,
                supporting maintainers with guidance, establishing interoperability standards, and
                fostering innovation while maintaining stability and developer trust.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <div className="h-2 w-2 rounded-full bg-success" />
                  </div>
                  <h3 className="font-semibold text-foreground">Excellence</h3>
                  <p className="text-sm text-foreground/60">
                    Maintaining high technical standards across all projects
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Innovation</h3>
                  <p className="text-sm text-foreground/60">
                    Supporting experimentation and emerging technologies
                  </p>
                </div>
                <div className="space-y-2 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">Collaboration</h3>
                  <p className="text-sm text-foreground/60">
                    Fostering cooperation between ecosystem projects
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Committee Members Grid */}
          <ScrollReveal animation="scale">
            <section className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                  Meet the Committee
                </h2>
                <p className="mt-4 text-lg text-foreground/60">
                  Technical experts dedicated to React ecosystem excellence
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {committeeMembers.map((member, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-3xl border border-border/10 bg-card transition-all hover:border-success/20 hover:shadow-lg"
                  >
                    {/* Card Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />

                    <div className="relative p-6">
                      {/* Headshot Placeholder */}
                      <div className="mb-4 flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border/20 bg-gradient-to-br from-muted to-muted/50">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <svg
                              className="h-12 w-12 text-muted-foreground/40"
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
                        <h3 className="text-lg font-semibold text-foreground">
                          {member.name}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-success">
                          {member.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>

                      {/* Bio */}
                      <p className="mt-4 text-xs leading-relaxed text-foreground/70">
                        {member.bio}
                      </p>

                      {/* Expertise Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {member.expertise.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-[10px] text-foreground/80"
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
                Committee Responsibilities
              </h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Technical Standards
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Establishing and maintaining technical standards, API design guidelines,
                    and best practices for ecosystem libraries.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Innovation Support
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Evaluating emerging technologies, experimental features, and new patterns
                    that could benefit the React ecosystem.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Documentation & Education
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Ensuring comprehensive technical documentation, guides, and educational
                    resources for the community.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Ecosystem Coordination
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Facilitating collaboration between projects, resolving technical conflicts,
                    and promoting interoperability.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Security & Quality
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Establishing security protocols, vulnerability response processes, and
                    quality assurance standards.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/10 bg-background/[0.03] p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-500">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Performance & Optimization
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/70">
                    Guiding performance optimization strategies, benchmarking practices, and
                    establishing performance budgets.
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Working Groups */}
          <ScrollReveal animation="fade-up">
            <section className="space-y-8 rounded-3xl border border-border/10 bg-gradient-to-br from-primary/5 via-success/5 to-accent/5 p-12">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Technical Working Groups
              </h2>
              <p className="max-w-3xl text-lg leading-relaxed text-foreground/70">
                The TSC organizes focused working groups to tackle specific technical challenges,
                explore new patterns, and develop proposals for ecosystem-wide adoption.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Framework Interop</h3>
                  <p className="text-sm text-foreground/70">
                    Ensuring libraries work seamlessly across React frameworks
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Testing Standards</h3>
                  <p className="text-sm text-foreground/70">
                    Developing unified testing approaches and tools
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Server Components</h3>
                  <p className="text-sm text-foreground/70">
                    Exploring patterns for RSC adoption in libraries
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Type Safety</h3>
                  <p className="text-sm text-foreground/70">
                    Improving TypeScript integration across ecosystem
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Accessibility</h3>
                  <p className="text-sm text-foreground/70">
                    Establishing a11y standards and best practices
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-border/10 bg-background/50 p-6">
                  <h3 className="font-semibold text-foreground">Build Tooling</h3>
                  <p className="text-sm text-foreground/70">
                    Optimizing build systems and developer experience
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* CTA Section */}
          <ScrollReveal animation="fade-up">
            <section className="rounded-3xl border border-border/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 p-12 text-center">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Get Involved in Technical Discussions
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
                Join our technical discussions, propose new standards, and help shape the
                future of the React ecosystem.
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

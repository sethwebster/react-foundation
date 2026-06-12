import type { Metadata } from "next";
import { BadgeCheck, BookOpen, CircleUserRound, Code2, Globe2, Lightbulb, ShieldCheck, Wrench, Zap } from "lucide-react";

import { OrbitMarks, Panel, PanelActions, PanelButton, PanelEyebrow, PanelSub, RowList } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";

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

const missionValues = [
  {
    title: "Excellence",
    description: "Maintaining high technical standards across all projects",
  },
  {
    title: "Innovation",
    description: "Supporting experimentation and emerging technologies",
  },
  {
    title: "Collaboration",
    description: "Fostering cooperation between ecosystem projects",
  },
];

const responsibilities = [
  {
    icon: Code2,
    title: "Technical Standards",
    description:
      "Establishing and maintaining technical standards, API design guidelines, and best practices for ecosystem libraries.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Support",
    description:
      "Evaluating emerging technologies, experimental features, and new patterns that could benefit the React ecosystem.",
  },
  {
    icon: BookOpen,
    title: "Documentation & Education",
    description:
      "Ensuring comprehensive technical documentation, guides, and educational resources for the community.",
  },
  {
    icon: Globe2,
    title: "Ecosystem Coordination",
    description:
      "Facilitating collaboration between projects, resolving technical conflicts, and promoting interoperability.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Quality",
    description:
      "Establishing security protocols, vulnerability response processes, and quality assurance standards.",
  },
  {
    icon: Zap,
    title: "Performance & Optimization",
    description:
      "Guiding performance optimization strategies, benchmarking practices, and establishing performance budgets.",
  },
];

const workingGroups = [
  {
    title: "Framework Interop",
    description: "Ensuring libraries work seamlessly across React frameworks",
  },
  {
    title: "Testing Standards",
    description: "Developing unified testing approaches and tools",
  },
  {
    title: "Server Components",
    description: "Exploring patterns for RSC adoption in libraries",
  },
  {
    title: "Type Safety",
    description: "Improving TypeScript integration across ecosystem",
  },
  {
    title: "Accessibility",
    description: "Establishing a11y standards and best practices",
  },
  {
    title: "Build Tooling",
    description: "Optimizing build systems and developer experience",
  },
];

export default function TechnicalSteeringCommitteePage() {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="tsc-hero-title" className="flex min-h-[56vh] flex-col">
        <OrbitMarks className="left-[68%] top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-[1] mt-auto pt-16 md:pt-[88px]">
          <h1
            id="tsc-hero-title"
            className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
          >
            Technical Steering Committee
          </h1>
          <p className="mt-4 max-w-[43rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
            The TSC drives technical excellence across React libraries, tools, and frameworks
            through standards, best practices, and support for responsible innovation.
          </p>
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="technical-mission-title">
        <PanelEyebrow id="technical-mission-title">Our technical mission</PanelEyebrow>
        <p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
          The TSC keeps technical decisions aligned with the ecosystem&apos;s long-term health:
          maintainer guidance, interoperability standards, and innovation that preserves
          stability and developer trust.
        </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-3">
          {missionValues.map((value) => (
            <div
              key={value.title}
              className="bg-white p-6"
            >
              <BadgeCheck size={24} strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 text-[17px] font-semibold text-[#16181D]">{value.title}</h3>
              <p className="mt-1 text-sm leading-[1.55] text-[#5E687E]">{value.description}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="committee-members-title">
        <PanelEyebrow id="committee-members-title">Meet the committee</PanelEyebrow>
        <PanelSub>Technical experts dedicated to React ecosystem excellence.</PanelSub>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-2 lg:grid-cols-3">
          {committeeMembers.map((member) => (
            <article
              key={member.title}
              className="bg-white p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EBECF0] bg-[#F6F7F9] text-[#5E687E]">
                <CircleUserRound size={32} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#16181D]">{member.name}</h3>
              <p className="mt-1 text-xs font-medium text-[#087EA4]">{member.title}</p>
              <p className="mt-1 text-xs text-[#5E687E]">{member.role}</p>
              <p className="mt-4 text-xs leading-[1.6] text-[#5E687E]">{member.bio}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {member.expertise.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#EBECF0] px-2 py-0.5 text-[10px] text-[#5E687E]">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="committee-responsibilities-title">
        <PanelEyebrow id="committee-responsibilities-title">Committee responsibilities</PanelEyebrow>
        <PanelSub>The committee supports standards, security, coordination, and performance across the ecosystem.</PanelSub>
        <RowList className="mt-4">
          {responsibilities.map((responsibility) => (
            <div key={responsibility.title} className="grid gap-x-5 gap-y-3 py-6 text-[#16181D] md:grid-cols-[24px_minmax(0,1fr)]">
              <responsibility.icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold">{responsibility.title}</h3>
                <p className="mt-1 max-w-[44rem] text-sm leading-[1.55] text-[#5E687E]">
                  {responsibility.description}
                </p>
              </div>
            </div>
          ))}
        </RowList>
      </Panel>

      <Panel tone="paper" labelledBy="working-groups-title">
        <PanelEyebrow id="working-groups-title">Technical working groups</PanelEyebrow>
        <PanelSub>
          The TSC organizes focused working groups to tackle technical challenges and develop ecosystem-wide proposals.
        </PanelSub>
        <RowList className="mt-4">
          {workingGroups.map((group) => (
            <div key={group.title} className="grid gap-x-5 gap-y-3 py-5 text-[#16181D] md:grid-cols-[24px_minmax(0,1fr)]">
              <Wrench size={24} strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold">{group.title}</h3>
                <p className="mt-1 max-w-[44rem] text-sm leading-[1.55] text-[#5E687E]">{group.description}</p>
              </div>
            </div>
          ))}
        </RowList>
      </Panel>

      <Panel tone="paper" labelledBy="technical-cta-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <PanelEyebrow id="technical-cta-title">Get involved in technical discussions</PanelEyebrow>
            <p className="mt-4 max-w-[44rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
              Join technical discussions, propose standards, and help shape the future of the React ecosystem.
            </p>
          </div>
          <PanelActions>
            <PanelButton href="/about" variant="outline">
              About the Foundation
            </PanelButton>
            <PanelButton href="/impact" variant="ink">
              View Our Impact
            </PanelButton>
          </PanelActions>
        </div>
      </Panel>

      <PanelsFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { Code, Landmark } from "lucide-react";

import { BecomeContributor } from "@/components/home/become-contributor";
import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import { ExecutiveMessage } from "@/components/home/executive-message";
import { FoundingMembers } from "@/components/home/founding-members";
import {
  OrbitMarks,
  Panel,
  PanelActions,
  PanelButton,
  PanelEyebrow,
  PanelSub,
  Row,
  RowArrow,
  RowList,
  RowRight,
} from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";
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

const MISSION_POINTS = [
  {
    title: "Sustainable Funding",
    description: "Creating reliable revenue streams that support open source maintainers",
  },
  {
    title: "Full Transparency",
    description: "Quarterly reports showing exactly how funds are distributed",
  },
  {
    title: "Community First",
    description: "Decisions driven by community needs and maintainer feedback",
  },
];

const HOW_IT_WORKS_STEPS = [
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

const GOVERNANCE_BODIES = [
  {
    icon: Landmark,
    href: "/about/board-of-directors",
    title: "Board of Directors",
    subtitle: "Strategic Leadership · Financial Oversight · Governance",
    description:
      "Our Board provides strategic guidance, ensures financial oversight, and maintains the foundation's commitment to transparency and community-first values.",
  },
  {
    icon: Code,
    href: "/about/technical-steering-committee",
    title: "Technical Steering Committee",
    subtitle: "Technical Excellence · Innovation · Open Standards",
    description:
      "The TSC drives technical excellence across the React ecosystem, establishing standards, best practices, and supporting innovation in libraries and tools.",
  },
];

const GOVERNANCE_PRINCIPLES = [
  { title: "Open Financials", description: "Every dollar tracked and reported publicly" },
  { title: "Community Input", description: "Major decisions informed by maintainer feedback" },
  { title: "Quarterly Reports", description: "Detailed impact metrics published every quarter" },
  { title: "Open Source Values", description: "Built on the same principles as the ecosystem we support" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <div className="mx-auto w-full max-w-[1200px] lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-4">
        <main className="flex min-w-0 flex-col gap-2.5 md:gap-4">
          <Panel tone="cyan" labelledBy="about-hero-title">
            <OrbitMarks className="left-[72%] top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-[1]">
              <h1
                id="about-hero-title"
                className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
              >
                About React Foundation
              </h1>
              <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
                We&apos;re building a sustainable future for the React ecosystem through
                community funding, transparent governance, and support for the
                maintainers who make it all possible.
              </p>
            </div>
          </Panel>

          <div id="executive-message" className="scroll-mt-24">
            <ExecutiveMessage />
          </div>

          <Panel tone="paper" id="mission" labelledBy="mission-title">
            <PanelEyebrow id="mission-title">Our mission</PanelEyebrow>
            <p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
              The React Foundation exists to ensure the React ecosystem{" "}
              <span className="text-[#087EA4]">thrives for generations to come</span>. We
              provide direct financial support to maintainers, fund educational
              initiatives, and ensure accessibility for developers worldwide.
            </p>
            <RowList className="mt-10 max-w-[44rem]">
              {MISSION_POINTS.map((point) => (
                <div key={point.title} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-[17px] font-semibold text-[#16181D]">{point.title}</h3>
                  <p className="mt-1 text-sm leading-[1.55] text-[#5E687E]">{point.description}</p>
                </div>
              ))}
            </RowList>
          </Panel>

          <Panel tone="paper" id="how-it-works" labelledBy="how-it-works-title">
            <PanelEyebrow id="how-it-works-title">How it works</PanelEyebrow>
            <div className="mt-4 divide-y divide-[color:var(--panel-rule)]">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-x-5 py-6"
                >
                  <span className="font-mono-panels mt-1 text-[15px] font-medium text-[#16181D]">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold text-[#16181D]">{step.title}</h3>
                    <p className="mt-1 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div id="founding-members" className="scroll-mt-24">
            <FoundingMembers />
          </div>

          <div id="supported-ecosystem" className="scroll-mt-24">
            <EcosystemLibraries title="Supported ecosystem" showMissingLibraryIssue />
          </div>

          <Panel tone="paper" id="governance" labelledBy="governance-title">
            <PanelEyebrow id="governance-title">Transparent governance</PanelEyebrow>
            <PanelSub>
              The React Foundation operates with complete transparency. All funding
              decisions, impact reports, and financial details are published quarterly
              for community review and feedback.
            </PanelSub>
            <RowList className="mt-4">
              {GOVERNANCE_BODIES.map((body) => (
                <Row key={body.href} href={body.href} className="py-6">
                  <body.icon size={24} strokeWidth={1.5} aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-semibold">{body.title}</h3>
                    <p className="mt-0.5 text-[13px] text-[#5E687E]">{body.subtitle}</p>
                    <p className="mt-2 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
                      {body.description}
                    </p>
                  </div>
                  <RowRight>
                    <RowArrow />
                  </RowRight>
                </Row>
              ))}
            </RowList>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {GOVERNANCE_PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-2xl border border-[#EBECF0] bg-white p-6"
                >
                  <h3 className="text-[17px] font-semibold text-[#16181D]">{principle.title}</h3>
                  <p className="mt-1 text-sm text-[#5E687E]">{principle.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div id="become-contributor" className="scroll-mt-24">
            <BecomeContributor />
          </div>

          <Panel tone="paper" labelledBy="about-cta-title">
            <PanelEyebrow id="about-cta-title">Ready to make an impact?</PanelEyebrow>
            <p className="mt-4 max-w-[40rem] text-[26px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#16181D] md:text-[28px]">
              Start supporting the React ecosystem today. Every contribution helps build
              a sustainable future for open source.
            </p>
            <PanelActions>
              <PanelButton href="/store" variant="ink">
                Shop the Store
              </PanelButton>
              <PanelButton href="/impact" variant="outline">
                View Our Impact
              </PanelButton>
            </PanelActions>
          </Panel>
        </main>

        <RFDS.TableOfContents sections={sections} variant="panels" />
      </div>

      <PanelsFooter />
    </div>
  );
}

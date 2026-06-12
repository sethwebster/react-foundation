import type { Metadata } from "next";
import { BarChart3, BookOpen, CircleDollarSign, Globe, MessageSquare, Users } from "lucide-react";

import { EcosystemLibraries } from "@/components/home/ecosystem-libraries";
import {
  OrbitMarks,
  Panel,
  PanelActions,
  PanelButton,
  PanelEyebrow,
  PanelSub,
} from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";
import { ecosystemLibraries } from "@/lib/maintainer-tiers";

export const metadata: Metadata = {
  title: "Impact Reports | React Foundation",
  description: "See how React Foundation funding supports the ecosystem with transparent quarterly reports.",
};

const REPORT_CONTENTS = [
  {
    icon: CircleDollarSign,
    title: "Revenue Details",
    description: "Total revenue generated from all sources",
  },
  {
    icon: Users,
    title: "Maintainer Funding",
    description: "Breakdown of funding by library and maintainer",
  },
  {
    icon: BookOpen,
    title: "Education Initiatives",
    description: "Tutorials, docs, and learning resources supported",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Global accessibility improvements funded",
  },
  {
    icon: BarChart3,
    title: "Impact Metrics",
    description: "Downloads, usage, and ecosystem growth data",
  },
  {
    icon: MessageSquare,
    title: "Community Feedback",
    description: "Testimonials from maintainers and contributors",
  },
];

const DISTRIBUTION_STEPS = [
  {
    title: "Contribution Tracking",
    description:
      "We track pull requests, issues, and commits across all 54 supported libraries using GitHub's GraphQL API.",
  },
  {
    title: "Score Calculation",
    description:
      "Contributions are weighted (PRs × 8 + Issues × 3 + Commits × 1) to calculate fair distribution ratios.",
  },
  {
    title: "Fund Distribution",
    description:
      "100% of profits are distributed quarterly based on contribution scores and library impact metrics.",
  },
];

export default function ImpactPage() {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="impact-hero-title" className="flex min-h-[44vh] flex-col">
        <OrbitMarks className="left-[72%] top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-[1] mt-auto pt-12 md:pt-16">
          <h1
            id="impact-hero-title"
            className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
          >
            Our Impact
          </h1>
          <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
            Full transparency on how your support funds the React ecosystem. Every
            contribution is tracked and reported publicly.
          </p>
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="impact-coming-soon-title">
        <PanelEyebrow id="impact-coming-soon-title">First report coming soon</PanelEyebrow>
        <PanelSub>
          Our inaugural quarterly impact report will be published once the store
          launches. Each report will provide complete transparency into fund
          distribution.
        </PanelSub>
        <div className="mt-4 divide-y divide-[color:var(--panel-rule)]">
          {REPORT_CONTENTS.map((item) => (
            <div
              key={item.title}
              className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-x-5 py-5"
            >
              <item.icon size={24} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 text-[#16181D]" />
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold text-[#16181D]">{item.title}</h3>
                <p className="mt-1 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <EcosystemLibraries
        id="libraries"
        title="Supported ecosystem"
        description={`We track contributions across all ${ecosystemLibraries.length} critical React ecosystem libraries, ensuring fair distribution of funds based on contribution metrics.`}
      />

      <Panel tone="paper" labelledBy="impact-funds-title">
        <PanelEyebrow id="impact-funds-title">How funds are distributed</PanelEyebrow>
        <PanelSub>
          We use a transparent, metrics-based approach to ensure fair distribution of
          funds to maintainers across the React ecosystem.
        </PanelSub>
        <div className="mt-4 divide-y divide-[color:var(--panel-rule)]">
          {DISTRIBUTION_STEPS.map((step, index) => (
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

      <Panel tone="paper" labelledBy="impact-cta-title">
        <PanelEyebrow id="impact-cta-title">Support the ecosystem</PanelEyebrow>
        <p className="mt-4 max-w-[40rem] text-[26px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#16181D] md:text-[28px]">
          Every purchase directly supports React ecosystem maintainers. Shop the store
          to make an impact today.
        </p>
        <PanelActions>
          <PanelButton href="/store" variant="ink">
            Shop the Store
          </PanelButton>
          <PanelButton href="/about" variant="outline">
            Learn More
          </PanelButton>
        </PanelActions>
      </Panel>

      <PanelsFooter />
    </div>
  );
}

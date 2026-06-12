import type { Metadata } from "next";
import { BadgeCheck, CircleDollarSign, CircleUserRound, FileText, MessageCircle, ShieldCheck } from "lucide-react";

import { OrbitMarks, Panel, PanelActions, PanelButton, PanelEyebrow, PanelSub, RowList } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";

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

const philosophyValues = [
  {
    title: "Transparent",
    description: "All decisions and finances publicly documented",
  },
  {
    title: "Accountable",
    description: "Regular reporting and community oversight",
  },
  {
    title: "Community-First",
    description: "Decisions guided by ecosystem needs",
  },
];

const responsibilities = [
  {
    icon: ShieldCheck,
    title: "Strategic Direction",
    description:
      "Setting long-term goals, priorities, and initiatives that serve the React ecosystem's growth and sustainability.",
  },
  {
    icon: CircleDollarSign,
    title: "Financial Oversight",
    description:
      "Ensuring responsible fund management, transparent distribution to maintainers, and regular financial reporting.",
  },
  {
    icon: MessageCircle,
    title: "Community Engagement",
    description:
      "Maintaining open dialogue with maintainers, contributors, and the broader React community to inform decisions.",
  },
  {
    icon: FileText,
    title: "Governance & Compliance",
    description:
      "Establishing policies, ensuring legal compliance, and maintaining the foundation's integrity and mission alignment.",
  },
];

export default function BoardOfDirectorsPage() {
  return (
    <div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
      <Panel tone="cyan" labelledBy="board-hero-title">
        <OrbitMarks className="left-[68%] top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-[1]">
          <h1
            id="board-hero-title"
            className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
          >
            Board of Directors
          </h1>
          <p className="mt-4 max-w-[42rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
            The Board provides strategic guidance, financial oversight, and a clear commitment
            to transparent, community-first governance.
          </p>
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="governance-title">
        <PanelEyebrow id="governance-title">Our governance philosophy</PanelEyebrow>
        <p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
          The React Foundation operates with complete transparency and community accountability.
          The Board keeps decisions focused on the ecosystem&apos;s best interests, with quarterly
          reports, open financials, and active community feedback loops.
        </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-3">
          {philosophyValues.map((value) => (
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

      <Panel tone="paper" labelledBy="board-members-title">
        <PanelEyebrow id="board-members-title">Meet the board</PanelEyebrow>
        <PanelSub>Leaders committed to building a sustainable future for React.</PanelSub>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member) => (
            <article
              key={member.title}
              className="bg-white p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#EBECF0] bg-[#F6F7F9] text-[#5E687E]">
                <CircleUserRound size={32} strokeWidth={1.5} aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#16181D]">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-[#087EA4]">{member.title}</p>
              <p className="mt-1 text-sm text-[#5E687E]">{member.role}</p>
              <p className="mt-5 text-sm leading-[1.6] text-[#5E687E]">{member.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {member.expertise.map((skill) => (
                  <span key={skill} className="rounded-full border border-[#EBECF0] px-3 py-1 text-xs text-[#5E687E]">
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel tone="paper" labelledBy="board-responsibilities-title">
        <PanelEyebrow id="board-responsibilities-title">Board responsibilities</PanelEyebrow>
        <PanelSub>The Board keeps governance, funding, and community accountability aligned.</PanelSub>
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

      <Panel tone="paper" labelledBy="board-cta-title">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <PanelEyebrow id="board-cta-title">Learn more about our governance</PanelEyebrow>
            <p className="mt-4 max-w-[44rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
              Explore transparent operations, quarterly reports, and the work behind a sustainable
              React ecosystem.
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

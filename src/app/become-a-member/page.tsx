import type { Metadata } from "next";

import {
	Panel,
	PanelActions,
	PanelButton,
	PanelEyebrow,
	PanelPlainLink,
	PanelSub,
	RowList,
} from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";

const ENROLLMENT_URL =
	"https://enrollment.lfx.linuxfoundation.org/?project=react-foundation";

const memberReasons = [
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
	title: "Become a Member | React Foundation",
	description:
		"Become a React Foundation member and help sustain the ecosystem, maintainers, and community programs that support React's future.",
};

export default function BecomeMemberPage() {
	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<Panel tone="cyan" labelledBy="member-hero-title">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
					<div>
						<h1
							id="member-hero-title"
							className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
						>
							Help sustain the future of React.
						</h1>
						<p className="mt-4 max-w-[36rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
							React is more than a library. It is an ecosystem of maintainers,
							educators, tools, frameworks, and community spaces that help teams
							build for the web and beyond. Members help keep that ecosystem
							healthy, independent, and durable.
						</p>
						<PanelActions>
							<PanelButton href={ENROLLMENT_URL} variant="ink">
								Join as a member
							</PanelButton>
							<PanelButton href="#membership" variant="outline">
								See what membership supports
							</PanelButton>
						</PanelActions>
					</div>

					<aside className="rounded-2xl border border-[rgba(22,24,29,0.2)] p-8">
						<p className="text-[13px] font-medium tracking-[0.01em] text-[rgba(22,24,29,0.65)]">
							Direct enrollment
						</p>
						<h2 className="mt-4 text-xl font-semibold text-[#16181D]">Ready to join?</h2>
						<p className="mt-4 text-[15px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
							Enrollment is handled through the Linux Foundation. The form opens
							with React Foundation selected so your organization can begin the
							membership process directly.
						</p>
						<div className="mt-6">
							<PanelButton href={ENROLLMENT_URL} variant="ink">
								Open enrollment form
							</PanelButton>
						</div>
					</aside>
				</div>
			</Panel>

			<Panel tone="paper" id="membership" labelledBy="membership-title">
				<PanelEyebrow id="membership-title">Membership</PanelEyebrow>
				<p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
					Members fund the shared work behind React.
				</p>
				<PanelSub>
					Your support helps the foundation invest where individual projects
					and volunteer maintainers should not have to carry the burden alone.
				</PanelSub>
				<RowList className="mt-6">
					{memberReasons.map((reason) => (
						<div key={reason.title} className="py-[26px]">
							<h3 className="text-xl font-semibold text-[#16181D]">{reason.title}</h3>
							<p className="mt-1 max-w-[40rem] text-[15px] leading-[1.55] text-[#5E687E]">
								{reason.description}
							</p>
						</div>
					))}
				</RowList>
			</Panel>

			<Panel tone="paper" labelledBy="member-value-title">
				<div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
					<div>
						<PanelEyebrow id="member-value-title">Member value</PanelEyebrow>
						<p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
							Built for organizations that depend on React.
						</p>
						<PanelSub>
							Membership is for companies, platforms, agencies, and teams who
							want React to remain a strong open ecosystem with clear stewardship
							and practical support for the people doing the work.
						</PanelSub>
					</div>

					<div className="grid gap-px overflow-hidden rounded-2xl border border-[#EBECF0] bg-[#EBECF0] sm:grid-cols-2">
						{membershipBenefits.map((benefit) => (
							<div key={benefit} className="bg-[#F6F7F9] p-5 text-[15px] leading-[1.55] text-[#5E687E]">
								{benefit}
							</div>
						))}
					</div>
				</div>
			</Panel>

			<Panel tone="paper" labelledBy="investment-title">
				<PanelEyebrow id="investment-title">Investment areas</PanelEyebrow>
				<p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
					Practical support for a broad ecosystem.
				</p>
				<PanelSub>
					React Foundation membership helps create capacity for work that
					benefits the whole ecosystem, not just one product roadmap or one
					organization&apos;s priorities.
				</PanelSub>
				<RowList className="mt-6">
					{investmentAreas.map((area) => (
						<div key={area} className="py-4 text-[17px] font-semibold text-[#16181D]">
							{area}
						</div>
					))}
				</RowList>
			</Panel>

			<Panel tone="paper" labelledBy="cta-title">
				<div className="text-center">
					<PanelEyebrow id="cta-title">Start membership</PanelEyebrow>
					<p className="mx-auto mt-4 max-w-[48rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
						Join the organizations helping React stay healthy for everyone.
					</p>
					<p className="mx-auto mt-4 max-w-[32rem] text-[15px] leading-[1.55] text-[#5E687E]">
						Begin with the Linux Foundation enrollment form, or return to the
						foundation site to learn more about our mission and governance.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:mt-8 md:gap-4">
						<PanelButton href={ENROLLMENT_URL} variant="ink">
							Join now
						</PanelButton>
						<PanelPlainLink href="/about">Learn about the foundation</PanelPlainLink>
					</div>
				</div>
			</Panel>

			<PanelsFooter />
		</div>
	);
}

import { CircleDollarSign, Code, Heart, UserPlus } from "lucide-react";

import { Panel, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "@/components/panels/panel";
import type { ContentRow } from "@/components/panels/types";

const CONTRIBUTE_PATHWAYS: ContentRow[] = [
	{
		icon: Code,
		title: "Contribute to Repos",
		description:
			"Submit code, RFCs, documentation, or bug reports to React and 54+ ecosystem libraries.",
		cta: { label: "Browse React Repos", href: "https://github.com/facebook/react" },
	},
	{
		icon: CircleDollarSign,
		title: "Support Financially",
		description:
			"Store purchases, donations, and sponsorships all go toward maintainers, education, and accessibility work.",
		cta: { label: "Learn More", href: "/store" },
	},
	{
		icon: Heart,
		title: "Sponsor a Library",
		description:
			"Put money behind a specific library. Choose from 54, including Redux, TanStack Query, and React Router.",
		cta: { label: "Browse Libraries", href: "/impact#libraries" },
	},
	{
		icon: UserPlus,
		title: "Become a Member",
		description:
			"Members get a vote on funding decisions, updates before anyone else, and recognition in the community.",
		cta: {
			label: "Apply Now",
			href: "https://enrollment.lfx.linuxfoundation.org/?project=react-foundation",
			external: true,
		},
	},
];

export function PanelContribute() {
	return (
		<Panel tone="paper" id="contribute" labelledBy="contribute-title">
			<PanelEyebrow id="contribute-title">Become a contributor</PanelEyebrow>
			<PanelSub>
				Write code, give money, sponsor a library you depend on, or join as a member.
				Every path funds the same work.
			</PanelSub>
			<RowList className="mt-4">
				{CONTRIBUTE_PATHWAYS.map((pathway) => (
					<Row key={pathway.title} href={pathway.cta.href} external={pathway.cta.external} className="py-6">
						<pathway.icon size={24} strokeWidth={1.5} aria-hidden="true" />
						<div className="min-w-0">
							<h3 className="text-[17px] font-semibold">{pathway.title}</h3>
							<p className="mt-1 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
								{pathway.description}
							</p>
						</div>
						<RowRight className="text-[#087EA4]">
							{pathway.cta.label} <RowArrow />
						</RowRight>
					</Row>
				))}
			</RowList>
		</Panel>
	);
}

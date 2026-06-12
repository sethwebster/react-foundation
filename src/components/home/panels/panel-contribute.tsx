import { CircleDollarSign, Code, Heart, UserPlus } from "lucide-react";

import { Panel, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "./panel";
import type { ContentRow } from "./types";

const CONTRIBUTE_PATHWAYS: ContentRow[] = [
	{
		icon: Code,
		title: "Contribute to Repos",
		description:
			"Submit code, RFCs, proposals, documentation, or bug reports to React and 54+ ecosystem libraries. Your contributions directly improve the tools millions of developers use.",
		cta: { label: "Browse React Repos", href: "https://github.com/facebook/react" },
	},
	{
		icon: CircleDollarSign,
		title: "Support Financially",
		description:
			"Financial support is one way to help fund maintainers, educational resources, and accessibility initiatives. This includes store purchases, direct donations, and sponsorships.",
		cta: { label: "Learn More", href: "/store" },
	},
	{
		icon: Heart,
		title: "Sponsor a Library",
		description:
			"Directly sponsor your favorite React ecosystem library. Choose from 54 libraries including Redux, TanStack Query, React Router, and more.",
		cta: { label: "Browse Libraries", href: "/impact#libraries" },
	},
	{
		icon: UserPlus,
		title: "Become a Member",
		description:
			"Join the React Foundation as an official member. Get voting rights on funding decisions, exclusive updates, and recognition in our community.",
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
			<PanelEyebrow id="contribute-title">Become a Contributor</PanelEyebrow>
			<PanelSub>
				Join the movement to sustain and grow the React ecosystem. Contribute code,
				organize communities, create educational content, or support financially —
				every pathway helps build a stronger ecosystem.
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

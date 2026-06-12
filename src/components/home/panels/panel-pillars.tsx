import { BookOpen, Globe, HandHeart } from "lucide-react";

import { Panel, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "./panel";
import type { ContentRow } from "./types";

const PILLARS: ContentRow[] = [
	{
		icon: HandHeart,
		title: "Fund Maintainers",
		description:
			"Direct financial support for the developers maintaining the libraries you depend on every day. Maintainers receive funding through multiple channels including code contributions, sponsorships, and community support.",
		cta: { label: "See Impact", href: "/impact" },
	},
	{
		icon: BookOpen,
		title: "Education & Resources",
		description:
			"Supporting tutorials, documentation, workshops, and learning materials that help developers master React and its ecosystem.",
		cta: { label: "Learn More", href: "/impact" },
	},
	{
		icon: Globe,
		title: "Global Accessibility",
		description:
			"Ensuring React remains accessible and inclusive for developers worldwide, regardless of location, background, or resources.",
		cta: { label: "Our Commitment", href: "/impact" },
	},
];

export function PanelPillars() {
	return (
		<Panel tone="cyan" id="pillars" labelledBy="pillars-title">
			<PanelEyebrow id="pillars-title">Three Pillars of Impact</PanelEyebrow>
			<PanelSub>Every contribution supports our three core initiatives</PanelSub>
			<RowList className="mt-6">
				{PILLARS.map((pillar) => (
					<Row key={pillar.title} href={pillar.cta.href} className="py-[26px]">
						<pillar.icon size={24} strokeWidth={1.5} aria-hidden="true" />
						<div className="min-w-0">
							<h3 className="text-xl font-semibold">{pillar.title}</h3>
							<p className="mt-1 max-w-[40rem] text-[15px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
								{pillar.description}
							</p>
						</div>
						<RowRight>
							{pillar.cta.label} <RowArrow />
						</RowRight>
					</Row>
				))}
			</RowList>
		</Panel>
	);
}

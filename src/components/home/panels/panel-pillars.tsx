import { BookOpen, Globe, HandHeart } from "lucide-react";

import { Panel, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "@/components/panels/panel";
import type { ContentRow } from "@/components/panels/types";

const PILLARS: ContentRow[] = [
	{
		icon: HandHeart,
		title: "Fund Maintainers",
		description:
			"Direct financial support for the developers who maintain the libraries you depend on every day.",
		cta: { label: "See Impact", href: "/impact" },
	},
	{
		icon: BookOpen,
		title: "Education & Resources",
		description:
			"Tutorials, documentation, workshops, and learning materials that help developers master React.",
		cta: { label: "Learn More", href: "/impact" },
	},
	{
		icon: Globe,
		title: "Global Accessibility",
		description:
			"React stays free and learnable for developers everywhere, regardless of location, background, or resources.",
		cta: { label: "Our Commitment", href: "/impact" },
	},
];

export function PanelPillars() {
	return (
		<Panel tone="cyan" id="pillars" labelledBy="pillars-title">
			<PanelEyebrow id="pillars-title">What we fund</PanelEyebrow>
			<PanelSub>Every contribution lands in one of three programs.</PanelSub>
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

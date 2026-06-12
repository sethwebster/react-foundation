import type { Metadata } from "next";

import { PanelContribute } from "@/components/home/panels/panel-contribute";
import { PanelHero } from "@/components/home/panels/panel-hero";
import { PanelJoin } from "@/components/home/panels/panel-join";
import { PanelMembers } from "@/components/home/panels/panel-members";
import { PanelMetrics } from "@/components/home/panels/panel-metrics";
import { PanelMission } from "@/components/home/panels/panel-mission";
import { PanelPillars } from "@/components/home/panels/panel-pillars";
import { PanelsFooter } from "@/components/home/panels/panels-footer";

export const metadata: Metadata = {
	title: "React Foundation",
	description: "Supporting the React ecosystem through community funding and governance.",
};

export default function FoundationHome() {
	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<PanelHero />
			<PanelMetrics />
			<PanelMission />
			<PanelPillars />
			<PanelContribute />
			<PanelMembers />
			<PanelJoin />
			<PanelsFooter />
		</div>
	);
}

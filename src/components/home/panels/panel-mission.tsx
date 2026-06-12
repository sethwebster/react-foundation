import { Panel, PanelEyebrow } from "./panel";

export function PanelMission() {
	return (
		<Panel tone="paper" id="mission" labelledBy="mission-title">
			<PanelEyebrow id="mission-title">Our Mission</PanelEyebrow>
			<p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
				We exist to ensure the React ecosystem{" "}
				<span className="text-[#087EA4]">thrives for generations to come</span>. Through
				code contributions, community organizing, educational content creation, and
				sustainable funding, we support maintainers, educators, and community organizers
				who build the tools millions of developers rely on.
			</p>
		</Panel>
	);
}

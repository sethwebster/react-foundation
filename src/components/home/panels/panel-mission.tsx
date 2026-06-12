import { Panel, PanelEyebrow } from "@/components/panels/panel";

export function PanelMission() {
	return (
		<Panel tone="paper" id="mission" labelledBy="mission-title">
			<PanelEyebrow id="mission-title">Our mission</PanelEyebrow>
			<p className="mt-4 max-w-[56rem] text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.35] tracking-[-0.01em] text-[#16181D]">
				React now belongs to its community, not any single company. The foundation
				exists to <span className="text-[#087EA4]">make that permanent</span>: funded
				maintainers, solid documentation, and places where the next generation of React
				developers learns.
			</p>
		</Panel>
	);
}

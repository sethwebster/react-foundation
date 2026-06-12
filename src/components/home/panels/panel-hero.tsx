import { OrbitMarks, Panel, PanelActions, PanelButton, PanelPlainLink } from "@/components/panels/panel";

export function PanelHero() {
	return (
		<Panel tone="cyan" labelledBy="hero-title" className="flex min-h-[72vh] flex-col">
			<OrbitMarks className="left-[66%] top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2" />
			<div className="relative z-[1] mt-auto pt-16 md:pt-[88px]">
				<h1
					id="hero-title"
					className="max-w-[14ch] text-[clamp(40px,5.2vw,72px)] font-semibold leading-[1.04] tracking-[-0.02em] text-[#16181D]"
				>
					Building the future of React, together.
				</h1>
				<p className="mt-4 max-w-[36rem] text-[17px] leading-[1.55] text-[rgba(22,24,29,0.7)]">
					The React Foundation funds the work that keeps React healthy: maintenance,
					documentation, teaching, and the communities around it. Thousands of
					contributors already pitch in. Join them.
				</p>
				<PanelActions>
					<PanelButton href="#contribute" variant="ink">
						Get Involved
					</PanelButton>
					<PanelButton href="/about" variant="outline">
						Learn Our Story
					</PanelButton>
					<PanelPlainLink href="/store">Shop to Support</PanelPlainLink>
				</PanelActions>
			</div>
		</Panel>
	);
}

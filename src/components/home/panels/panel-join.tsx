import { OrbitMarks, Panel, PanelActions, PanelButton, PanelEyebrow, PanelPlainLink } from "./panel";

export function PanelJoin() {
	return (
		<Panel tone="cyan" labelledBy="join-title">
			<OrbitMarks className="-right-[170px] -top-[150px] h-[520px] w-[520px]" />
			<div className="relative z-[1]">
				<PanelEyebrow id="join-title">Join the Movement</PanelEyebrow>
				<p className="mt-4 max-w-[40rem] text-[26px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#16181D] md:text-[28px]">
					Whether you contribute code, organize meetups, create educational content,
					or support financially, there are many ways to participate in building a
					sustainable future for the React ecosystem.
				</p>
				<PanelActions>
					<PanelButton href="#contribute" variant="ink">
						Get Involved
					</PanelButton>
					<PanelButton href="/impact" variant="outline">
						View Impact Reports
					</PanelButton>
					<PanelPlainLink href="/store">Shop the Store</PanelPlainLink>
				</PanelActions>
			</div>
		</Panel>
	);
}

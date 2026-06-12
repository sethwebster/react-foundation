import { Panel, PanelButton, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "./panel";
import type { MemberName } from "./types";

const MEMBER_COLUMNS: MemberName[][] = [
	["Meta", "Amazon", "Microsoft", "Huawei"],
	["Software Mansion", "Expo", "Callstack", "Vercel"],
];

export function PanelMembers() {
	return (
		<Panel tone="paper" id="members" labelledBy="members-title">
			<PanelEyebrow id="members-title">Founding Members</PanelEyebrow>
			<PanelSub>
				We&apos;re grateful to our founding members who believe in sustaining the React
				ecosystem and supporting open source maintainers.
			</PanelSub>
			<div className="mt-2 grid grid-cols-1 md:grid-cols-2 md:gap-x-14">
				{MEMBER_COLUMNS.map((column, columnIndex) => (
					<RowList
						key={column[0]}
						className={
							// Restores the hairline where the two lists meet once they stack on mobile.
							columnIndex > 0 ? "max-md:border-t max-md:border-[color:var(--panel-rule)]" : undefined
						}
					>
						{column.map((name) => (
							<Row key={name} href="#" bare className="py-4">
								<span className="text-[17px] font-semibold">{name}</span>
								<RowRight bare>
									<RowArrow />
								</RowRight>
							</Row>
						))}
					</RowList>
				))}
			</div>
			<div className="mt-8 flex flex-col flex-wrap items-start justify-between gap-6 rounded-2xl border border-[#EBECF0] bg-white px-7 py-6 md:flex-row md:items-center">
				<div>
					<h3 className="text-[17px] font-semibold text-[#16181D]">Become a member</h3>
					<p className="mt-1 max-w-[36rem] text-sm text-[#5E687E]">
						Help fund React maintainers, education, and ecosystem support.
					</p>
				</div>
				<PanelButton href="/become-a-member" variant="ink">
					Become a member
				</PanelButton>
			</div>
		</Panel>
	);
}

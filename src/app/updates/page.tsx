import type { Metadata } from "next";

import { Panel, PanelEyebrow, PanelSub, Row, RowArrow, RowList, RowRight } from "@/components/panels/panel";
import { getAuthorBySlug } from "@/lib/authors";
import { getAllUpdates } from "@/lib/updates";

export const metadata: Metadata = {
	title: "Updates",
	description: "Latest news and announcements from the React Foundation.",
};

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export default function UpdatesPage() {
	const updates = getAllUpdates();

	return (
		<main className="contents">
			<Panel tone="paper" labelledBy="updates-title">
				<h1
					id="updates-title"
					className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
				>
					Updates
				</h1>
				<PanelSub>
					Stay informed about the latest news, announcements, and initiatives from the
					React Foundation.
				</PanelSub>
			</Panel>

			<Panel tone="paper" labelledBy="updates-list-title">
				<PanelEyebrow id="updates-list-title">Latest posts</PanelEyebrow>
				<RowList className="mt-4">
					{updates.map((update) => {
						const author = getAuthorBySlug(update.metadata.author);

						return (
							<Row
								key={update.slug}
								href={`/updates/${update.slug}`}
								className="grid-cols-1! py-6 md:grid-cols-[9rem_minmax(0,1fr)_auto]!"
							>
								<time
									dateTime={update.metadata.date}
									className="font-mono-panels text-[13px] font-medium text-[#5E687E]"
								>
									{formatDate(update.metadata.date)}
								</time>
								<div className="min-w-0">
									<h2 className="text-[19px] font-semibold leading-tight text-[#16181D]">
										{update.metadata.title}
									</h2>
									<p className="mt-2 max-w-[42rem] text-sm leading-[1.55] text-[#5E687E]">
										{update.metadata.description}
									</p>
								</div>
								<RowRight className="col-start-1! justify-self-start! text-[#087EA4] md:col-auto! md:justify-self-end!">
									{author?.name || update.metadata.author} <RowArrow />
								</RowRight>
							</Row>
						);
					})}
				</RowList>
			</Panel>
		</main>
	);
}

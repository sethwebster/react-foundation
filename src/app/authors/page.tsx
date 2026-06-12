import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Panel, PanelEyebrow, PanelSub } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";
import { getAllAuthors, type Author } from "@/lib/authors";

export const metadata: Metadata = {
	title: "Authors",
	description: "Meet the people behind the React Foundation.",
};

const SOCIAL_LINKS: Array<{
	key: "github" | "twitter" | "linkedin" | "website";
	label: string;
}> = [
	{ key: "github", label: "GitHub" },
	{ key: "twitter", label: "Twitter" },
	{ key: "linkedin", label: "LinkedIn" },
	{ key: "website", label: "Website" },
];

function AuthorSocialLinks({ author }: { author: Author }) {
	const hasSocialLinks = SOCIAL_LINKS.some((link) => author[link.key]);

	if (!hasSocialLinks) {
		return null;
	}

	return (
		<div className="mt-5 flex flex-wrap gap-2">
			{SOCIAL_LINKS.map((link) => {
				const href = author[link.key];

				if (!href) {
					return null;
				}

				return (
					<a
						key={link.key}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className="panels-anim rounded-full border border-[#16181D] px-3.5 py-1.5 text-[13px] font-medium text-[#16181D] hover:bg-[rgba(22,24,29,0.08)]"
					>
						{link.label}
					</a>
				);
			})}
		</div>
	);
}

export default function AuthorsPage() {
	const authors = getAllAuthors();

	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<main className="contents">
				<Panel tone="paper" labelledBy="authors-title">
					<h1
						id="authors-title"
						className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
					>
						Authors
					</h1>
					<PanelSub>Meet the people building and leading the React Foundation.</PanelSub>
				</Panel>

				<Panel tone="paper" labelledBy="authors-list-title">
					<PanelEyebrow id="authors-list-title">People</PanelEyebrow>
					<div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-[#EBECF0] md:grid-cols-2 lg:grid-cols-3">
						{authors.map((author) => (
							<article key={author.slug} className="bg-[#F6F7F9] p-6">
								<Link href={`/authors/${author.slug}`} className="group block text-[#16181D]">
									{author.avatar && (
										<div className="relative h-20 w-20 overflow-hidden rounded-full border border-[#16181D]/20">
											<Image
												src={author.avatar}
												alt={author.name}
												width={80}
												height={80}
												className="object-cover"
											/>
										</div>
									)}
									<h2 className="mt-5 text-xl font-semibold leading-tight group-hover:underline">
										{author.name}
									</h2>
									<p className="mt-2 text-sm font-medium text-[#5E687E]">{author.title}</p>
									<p className="mt-4 text-sm leading-[1.55] text-[#5E687E]">{author.bio}</p>
								</Link>
								<AuthorSocialLinks author={author} />
							</article>
						))}
					</div>
				</Panel>
			</main>
			<PanelsFooter />
		</div>
	);
}

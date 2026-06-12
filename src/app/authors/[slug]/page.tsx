import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Panel, PanelEyebrow, PanelPlainLink, Row, RowArrow, RowList, RowRight } from "@/components/panels/panel";
import { PanelsFooter } from "@/components/panels/panels-footer";
import { getAllAuthors, getAuthorBySlug, type Author } from "@/lib/authors";
import { getAllUpdates } from "@/lib/updates";

type AuthorPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateStaticParams() {
	const authors = getAllAuthors();

	return authors.map((author) => ({
		slug: author.slug,
	}));
}

export async function generateMetadata({
	params,
}: AuthorPageProps): Promise<Metadata> {
	const { slug } = await params;
	const author = getAuthorBySlug(slug);

	if (!author) {
		return {
			title: "Author not found",
		};
	}

	return {
		title: author.name,
		description: `${author.title} - ${author.bio}`,
	};
}

const SOCIAL_LINKS: Array<{
	key: "github" | "twitter" | "linkedin" | "website";
	label: string;
}> = [
	{ key: "github", label: "GitHub" },
	{ key: "twitter", label: "Twitter" },
	{ key: "linkedin", label: "LinkedIn" },
	{ key: "website", label: "Website" },
];

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function AuthorSocialLinks({ author }: { author: Author }) {
	const hasSocialLinks = SOCIAL_LINKS.some((link) => author[link.key]);

	if (!hasSocialLinks) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center justify-start gap-2 pt-2">
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
						className="panels-anim rounded-full border border-[#16181D] px-4 py-2 text-sm font-medium text-[#16181D] hover:bg-[rgba(22,24,29,0.08)]"
					>
						{link.label} →
					</a>
				);
			})}
		</div>
	);
}

export default async function AuthorPage({ params }: AuthorPageProps) {
	const { slug } = await params;
	const author = getAuthorBySlug(slug);

	if (!author) {
		notFound();
	}

	const authorUpdates = getAllUpdates().filter((update) => update.metadata.author === slug);

	return (
		<div className="flex min-h-screen flex-col gap-2.5 bg-[#EBECF0] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 md:gap-4 dark:bg-[#16181D]">
			<main className="contents">
				<Panel tone="paper" labelledBy="author-title">
					<div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
						{author.avatar && (
							<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-[#16181D]/20 md:h-32 md:w-32">
								<Image
									src={author.avatar}
									alt={author.name}
									width={128}
									height={128}
									className="object-cover"
								/>
							</div>
						)}
						<div className="min-w-0">
							<h1
								id="author-title"
								className="max-w-[16ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
							>
								{author.name}
							</h1>
							<p className="mt-3 text-lg text-[#5E687E]">{author.title}</p>
							<p className="mt-5 max-w-[42rem] text-base leading-[1.6] text-[#5E687E]">
								{author.bio}
							</p>
							<div className="mt-6">
								<AuthorSocialLinks author={author} />
							</div>
						</div>
					</div>
				</Panel>

				{authorUpdates.length > 0 && (
					<Panel tone="paper" labelledBy="author-updates-title">
						<PanelEyebrow id="author-updates-title">Updates by {author.name}</PanelEyebrow>
						<RowList className="mt-4">
							{authorUpdates.map((update) => (
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
										Read update <RowArrow />
									</RowRight>
								</Row>
							))}
						</RowList>
					</Panel>
				)}

				<Panel tone="paper" compact labelledBy="author-nav-title">
					<h2 id="author-nav-title" className="sr-only">
						Author navigation
					</h2>
					<PanelPlainLink href="/authors">All authors</PanelPlainLink>
				</Panel>
			</main>
			<PanelsFooter />
		</div>
	);
}

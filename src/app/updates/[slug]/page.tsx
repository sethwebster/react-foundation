import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Panel, PanelEyebrow, PanelPlainLink } from "@/components/panels/panel";
import { getAuthorBySlug } from "@/lib/authors";
import { getAllUpdates, getUpdateBySlug } from "@/lib/updates";

type UpdatePageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateStaticParams() {
	const updates = getAllUpdates();

	return updates.map((update) => ({
		slug: update.slug,
	}));
}

export async function generateMetadata({
	params,
}: UpdatePageProps): Promise<Metadata> {
	const { slug } = await params;
	const update = getUpdateBySlug(slug);

	if (!update) {
		return {
			title: "Update not found",
		};
	}

	return {
		title: update.metadata.title,
		description: update.metadata.description,
	};
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export default async function UpdatePage({ params }: UpdatePageProps) {
	const { slug } = await params;
	const update = getUpdateBySlug(slug);

	if (!update) {
		notFound();
	}

	const author = getAuthorBySlug(update.metadata.author);

	return (
		<article className="contents">
			<Panel tone="paper" labelledBy="update-title">
				<PanelEyebrow as="p">{formatDate(update.metadata.date)}</PanelEyebrow>
				<h1
					id="update-title"
					className="mt-4 max-w-[18ch] text-[clamp(36px,4vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#16181D]"
				>
					{update.metadata.title}
				</h1>

				{author && (
					<div className="mt-8 flex items-center gap-4">
						{author.avatar && (
							<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#16181D]/20">
								<Image
									src={author.avatar}
									alt={author.name}
									width={48}
									height={48}
									className="object-cover"
								/>
							</div>
						)}
						<div>
							<Link
								href={`/authors/${author.slug}`}
								className="font-semibold text-[#16181D] underline-offset-4 hover:underline"
							>
								{author.name}
							</Link>
							<p className="mt-0.5 text-sm text-[#5E687E]">{author.title}</p>
						</div>
					</div>
				)}
			</Panel>

			<div className="prose prose-lg prose-cyan mx-auto w-full max-w-[42rem] py-12 md:py-16">
				<MDXRemote source={update.content} />
			</div>

			<Panel tone="paper" compact labelledBy="update-nav-title">
				<h2 id="update-nav-title" className="sr-only">
					Update navigation
				</h2>
				<PanelPlainLink href="/updates">Back to all updates</PanelPlainLink>
			</Panel>
		</article>
	);
}

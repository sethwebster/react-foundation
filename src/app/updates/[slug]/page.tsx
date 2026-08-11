import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/components/public-site/layout";
import { getUpdateBySlug, getAllUpdates } from "@/lib/updates";
import { getAuthorBySlug } from "@/lib/authors";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";

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

export default async function UpdatePage({ params }: UpdatePageProps) {
  const { slug } = await params;
  const update = getUpdateBySlug(slug);

  if (!update) {
    notFound();
  }

  const author = getAuthorBySlug(update.metadata.author);

  return (
    <article>
      <Section as="div" className="pb-24 pt-14 sm:pb-32 sm:pt-24">
        <header className="animate-page-appear border-b border-border pb-10 sm:pb-14">
          <Link
            href="/updates"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <span aria-hidden>←</span>
            News
          </Link>

          <time
            dateTime={update.metadata.date}
            className="mt-10 block text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          >
            {formatUpdateDate(update.metadata.date)}
          </time>
          <h1 className="mt-4 max-w-[38rem] text-title font-semibold leading-[1.04] text-foreground">
            {update.metadata.title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-lead leading-8 text-muted-foreground">
            {update.metadata.description}
          </p>

          {author ? (
            <div className="mt-8 flex items-center gap-3.5">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt=""
                  aria-hidden
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <Link
                  href={`/authors/${author.slug}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {author.name}
                </Link>
                <p className="text-sm leading-5 text-muted-foreground">
                  {author.title}
                </p>
              </div>
            </div>
          ) : null}
        </header>

        <div className="prose prose-lg max-w-none pt-10 prose-headings:font-semibold prose-headings:leading-tight prose-h2:mt-14 prose-h2:text-2xl prose-h3:mt-10 prose-p:leading-8 prose-a:font-semibold prose-a:text-primary prose-a:decoration-primary/40 prose-a:underline-offset-4 prose-strong:font-semibold prose-li:marker:text-primary prose-blockquote:border-primary prose-blockquote:text-foreground prose-code:before:content-none prose-code:after:content-none dark:prose-invert sm:pt-14">
          <MDXRemote source={update.content} />
        </div>

        <footer className="mt-14 border-t border-border pt-8 sm:mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Keep reading
          </p>
          <Link
            href="/updates"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground hover:border-border-strong hover:bg-muted"
          >
            <span aria-hidden>←</span>
            All news
          </Link>
        </footer>
      </Section>
    </article>
  );
}

function formatUpdateDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

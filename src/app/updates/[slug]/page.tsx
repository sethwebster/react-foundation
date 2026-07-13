import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <article className="mx-auto max-w-3xl pt-6">
      <Link
        href="/updates"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to news
      </Link>

      {/* Post Header */}
      <header className="mt-8 space-y-6 border-b border-border/60 pb-10">
        <time
          dateTime={update.metadata.date}
          className="block text-sm font-medium text-muted-foreground"
        >
          {new Date(update.metadata.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </time>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {update.metadata.title}
        </h1>

        {/* Author Info */}
        {author && (
          <div className="flex items-center gap-3">
            {author.avatar && (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={44}
                  height={44}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <Link
                href={`/authors/${author.slug}`}
                className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                {author.name}
              </Link>
              <p className="text-sm text-muted-foreground">{author.title}</p>
            </div>
          </div>
        )}
      </header>

      {/* MDX Content with prose */}
      <div className="prose prose-lg mt-10 max-w-none">
        <MDXRemote source={update.content} />
      </div>

      {/* Back Link */}
      <div className="mt-14 border-t border-border/60 pt-8">
        <Link
          href="/updates"
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          ← Back to all updates
        </Link>
      </div>
    </article>
  );
}

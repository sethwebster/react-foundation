import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pill } from "@/components/ui/pill";
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
    <article className="pt-12">
      {/* Post Header */}
      <header className="space-y-6 pb-12">
        <Pill>
          Update ·{" "}
          {new Date(update.metadata.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Pill>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {update.metadata.title}
        </h1>

        {/* Author Info */}
        {author && (
          <div className="flex items-center gap-4">
            {author.avatar && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-border/20">
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
                className="font-semibold text-foreground hover:text-cyan-300"
              >
                {author.name}
              </Link>
              <p className="text-sm text-foreground/60">{author.title}</p>
            </div>
          </div>
        )}
      </header>

      {/* MDX Content with prose */}
      <div className="prose prose-lg prose-invert prose-cyan max-w-none">
        <MDXRemote source={update.content} />
      </div>

      {/* Back Link */}
      <div className="mt-12 border-t border-border/10 pt-8">
        <Link
          href="/updates"
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          ← Back to all updates
        </Link>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { getAllAuthors, getAuthorBySlug } from "@/lib/authors";
import { getAllUpdates } from "@/lib/updates";

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const author = getAuthorBySlug((await params).slug);
  return author
    ? { title: author.name, description: author.bio }
    : { title: "Author not found" };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = getAuthorBySlug((await params).slug);
  if (!author) notFound();

  const updates = getAllUpdates().filter(
    (update) => update.metadata.author === author.slug,
  );
  const socialLinks = [
    ["GitHub", author.github],
    ["X", author.twitter],
    ["LinkedIn", author.linkedin],
    ["Website", author.website],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24" measure="standard">
          <Link
            href="/authors"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span> All authors
          </Link>

          <div className="mt-10 grid gap-8 md:grid-cols-[10rem_minmax(0,1fr)] md:items-start">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                width={160}
                height={160}
                className="h-32 w-32 rounded-full object-cover md:h-40 md:w-40"
              />
            ) : null}
            <div>
              <h1 className="text-title font-semibold leading-tight text-foreground">
                {author.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                {author.title}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
                {author.bio}
              </p>
              {socialLinks.length ? (
                <div className="mt-6 flex flex-wrap gap-4">
                  {socialLinks.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {label} <span aria-hidden>↗</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Section>

        {updates.length ? (
          <Section className="py-20" measure="standard">
            <h2 className="text-2xl font-semibold text-foreground">
              Updates by {author.name}
            </h2>
            <div className="mt-7 space-y-4">
              {updates.map((update) => (
                <Surface key={update.slug} className="p-6">
                  <time
                    dateTime={update.metadata.date}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(update.metadata.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    <Link href={`/updates/${update.slug}`}>
                      {update.metadata.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {update.metadata.description}
                  </p>
                </Surface>
              ))}
            </div>
          </Section>
        ) : null}
      </main>
    </PublicPageShell>
  );
}

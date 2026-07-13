import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllUpdates } from "@/lib/updates";
import { getAuthorBySlug } from "@/lib/authors";

export const metadata: Metadata = {
  title: "Updates",
  description: "Latest news and announcements from the React Foundation.",
};

export default function UpdatesPage() {
  const updates = getAllUpdates();

  return (
    <main className="pt-10 sm:pt-14">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Latest news
        </h1>
        <div className="flex items-center gap-3">
          <a
            href="https://x.com/reactjs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow
          </a>
          <a
            href="mailto:hello@react.foundation?subject=Subscribe%20to%20React%20Foundation%20updates"
            className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Subscribe
          </a>
        </div>
      </div>

      {/* News list */}
      {updates.length === 0 ? (
        <p className="mt-12 text-sm text-muted-foreground">
          No updates published yet. Check back soon.
        </p>
      ) : (
        <section className="mt-12 space-y-5">
          {updates.map((update) => {
            const author = getAuthorBySlug(update.metadata.author);
            return (
              <Link
                key={update.slug}
                href={`/updates/${update.slug}`}
                className="group block rounded-[2.5rem] border border-border/60 bg-card p-8 transition-colors hover:border-border sm:p-10"
              >
                <time
                  dateTime={update.metadata.date}
                  className="text-sm text-muted-foreground"
                >
                  {new Date(update.metadata.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {update.metadata.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {update.metadata.description}
                </p>
                <div className="mt-6 flex items-center gap-2.5">
                  {author?.avatar ? (
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border">
                      <Image
                        src={author.avatar}
                        alt={author.name}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <span className="text-sm font-medium text-foreground">
                    {author?.name || update.metadata.author}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Archive */}
          <Link
            href="/authors"
            className="block rounded-[2.5rem] p-8 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:px-10"
          >
            View Archive →
          </Link>
        </section>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/public-site/layout";
import { getAuthorBySlug } from "@/lib/authors";
import { getAllUpdates } from "@/lib/updates";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and announcements from the React Foundation.",
};

export default function UpdatesPage() {
  const updates = getAllUpdates();

  return (
    <main>
      <Section className="pt-16 sm:pt-24">
        <div className="animate-page-appear flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[2.25rem] font-semibold leading-none text-foreground">
            Latest news
          </h1>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://x.com/reactjs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-muted px-4 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <XIcon />
              Follow
            </a>
            <Link
              href="/#newsletter"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-muted px-4 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              <MailIcon />
              Subscribe
            </Link>
          </div>
        </div>

        <div className="mt-12 space-y-5 sm:mt-16">
          {updates.map((update) => {
            const author = getAuthorBySlug(update.metadata.author);

            return (
              <Link
                key={update.slug}
                href={`/updates/${update.slug}`}
                className="group block rounded-panel border border-border bg-surface-raised p-6 shadow-card hover:border-border-strong hover:shadow-soft sm:px-7 sm:py-6"
              >
                <time
                  dateTime={update.metadata.date}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {formatUpdateDate(update.metadata.date)}
                </time>
                <h2 className="mt-4 text-lg font-semibold leading-tight text-foreground sm:text-xl">
                  {update.metadata.title}
                </h2>
                <p className="mt-2 max-w-[34rem] text-xs leading-5 text-muted-foreground">
                  {update.metadata.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    {author?.avatar ? (
                      <Image
                        src={author.avatar}
                        alt=""
                        aria-hidden
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                    ) : null}
                    <span className="text-xs font-medium text-muted-foreground">
                      {author?.name ?? update.metadata.author}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
    </main>
  );
}

function XIcon() {
  return (
    <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-6.4L6.46 22H3.34l7.26-8.3L2.95 2H9.36l4.42 5.84L18.9 2Zm-1.1 17.84h1.72L8.42 4.05H6.58L17.8 19.84Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function formatUpdateDate(date: string) {
  const value = new Date(date);
  const day = value.getUTCDate();
  const ordinal =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return `${value.toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  })} ${day}${ordinal}, ${value.getUTCFullYear()}`;
}

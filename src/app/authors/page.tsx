import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { getAllAuthors } from "@/lib/authors";

export const metadata: Metadata = {
  title: "Authors and Contributors",
  description: "People who write for the React Foundation.",
};

export default function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24">
          <PageIntro
            eyebrow="Foundation updates"
            title="Authors and contributors"
            description="People who write for the foundation and provide context for its public work."
          />
        </Section>

        <Section className="py-16 sm:py-20" measure="standard">
          <div className="grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
            {authors.map((author) => (
              <Link
                key={author.slug}
                href={`/authors/${author.slug}`}
                className="group bg-background p-7 transition hover:bg-muted sm:p-9"
              >
                <div className="flex items-center gap-5">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt=""
                      width={72}
                      height={72}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {author.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {author.title}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">
                  {author.bio}
                </p>
                <p className="mt-5 text-sm font-semibold text-primary">
                  View profile <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

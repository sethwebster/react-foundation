import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Pill } from "@/components/ui/pill";
import { Footer } from "@/components/layout/footer";
import { getAuthorBySlug, getAllAuthors } from "@/lib/authors";
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

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  // Get updates by this author
  const authorUpdates = getAllUpdates().filter(
    (update) => update.metadata.author === slug
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-12 pt-12">
          {/* Author Profile */}
          <section className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/60 p-12">
            <div className="flex flex-col items-center gap-6 text-center">
              {author.avatar && (
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  {author.name}
                </h1>
                <p className="mt-2 text-lg text-white/70">{author.title}</p>
              </div>
              <p className="max-w-2xl text-base leading-relaxed text-white/80">
                {author.bio}
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                {author.github && (
                  <a
                    href={author.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300"
                  >
                    GitHub →
                  </a>
                )}
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300"
                  >
                    Twitter →
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300"
                  >
                    LinkedIn →
                  </a>
                )}
                {author.website && (
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-300"
                  >
                    Website →
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Author's Updates */}
          {authorUpdates.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                Updates by {author.name}
              </h2>
              <div className="space-y-4">
                {authorUpdates.map((update) => (
                  <Link
                    key={update.slug}
                    href={`/updates/${update.slug}`}
                    className="block rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-white/20 hover:bg-slate-900/80"
                  >
                    <time
                      dateTime={update.metadata.date}
                      className="text-xs text-white/50"
                    >
                      {new Date(update.metadata.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {update.metadata.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/70">
                      {update.metadata.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back Link */}
          <div className="border-t border-white/10 pt-8">
            <Link
              href="/authors"
              className="text-sm text-cyan-400 transition hover:text-cyan-300"
            >
              ← All authors
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

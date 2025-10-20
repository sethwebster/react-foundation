import type { Metadata } from "next";
import Link from "next/link";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getAllUpdates } from "@/lib/updates";
import { getAuthorBySlug } from "@/lib/authors";

export const metadata: Metadata = {
  title: "Updates",
  description: "Latest news and announcements from the React Foundation.",
};

export default function UpdatesPage() {
  const updates = getAllUpdates();
  return (
    <main className="flex flex-1 flex-col gap-20">
      {/* Hero */}
      <section className="space-y-8 pt-12">
        <Pill>Latest News · Announcements · Community Updates</Pill>
        <div>
          <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Updates
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/70">
            Stay informed about the latest news, announcements, and initiatives from
            the React Foundation.
          </p>
        </div>
      </section>

      {/* Updates List */}
      <ScrollReveal animation="fade-up">
        <section className="space-y-8">
          {updates.map((update, idx) => {
            const author = getAuthorBySlug(update.metadata.author);

            return (
              <ScrollReveal key={update.slug} animation="fade-up" delay={idx * 100}>
                <Link
                  href={`/updates/${update.slug}`}
                  className="block rounded-3xl border border-white/10 bg-slate-900/60 p-8 transition hover:border-white/20 hover:bg-slate-900/80"
                >
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <time dateTime={update.metadata.date}>
                      {new Date(update.metadata.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    <span>·</span>
                    <span>{author?.name || update.metadata.author}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                    {update.metadata.title}
                  </h2>
                  <p className="mt-4 text-base text-white/70">{update.metadata.description}</p>
                  <div className="mt-6 text-sm text-cyan-400 transition hover:text-cyan-300">
                    Read more →
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </section>
      </ScrollReveal>
    </main>
  );
}

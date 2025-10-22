import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pill } from "@/components/ui/pill";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getAllAuthors } from "@/lib/authors";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Authors",
  description: "Meet the people behind the React Foundation.",
};

export default function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-30" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <main className="flex flex-col gap-20">
          {/* Hero */}
          <section className="space-y-8 pt-12">
            <Pill>Meet the Team · Contributors · Leadership</Pill>
            <div>
              <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Authors
              </h1>
              <p className="mt-8 max-w-2xl text-lg text-foreground/70">
                Meet the people building and leading the React Foundation.
              </p>
            </div>
          </section>

          {/* Authors Grid */}
          <ScrollReveal animation="fade-up">
            <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {authors.map((author, idx) => (
                <ScrollReveal key={author.slug} animation="scale" delay={idx * 100}>
                  <Link
                    href={`/authors/${author.slug}`}
                    className="group block rounded-3xl border border-border/10 bg-muted/60 p-8 transition hover:border-border/20 hover:bg-muted/80"
                  >
                    {author.avatar && (
                      <div className="mb-6 flex justify-center">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-border/20">
                          <Image
                            src={author.avatar}
                            alt={author.name}
                            width={96}
                            height={96}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <h2 className="text-center text-xl font-semibold text-foreground transition group-hover:text-cyan-300">
                      {author.name}
                    </h2>
                    <p className="mt-2 text-center text-sm text-foreground/60">{author.title}</p>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/70">{author.bio}</p>

                    {/* Social Links */}
                    <div className="mt-6 flex justify-center gap-4">
                      {author.github && (
                        <a
                          href={author.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/60 transition hover:text-cyan-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub
                        </a>
                      )}
                      {author.twitter && (
                        <a
                          href={author.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/60 transition hover:text-cyan-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Twitter
                        </a>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </section>
          </ScrollReveal>
        </main>
      </div>

      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getAllCollections, isShopifyEnabled } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore React Foundation collections - curated drops, collaborations, and essentials that power open-source innovation.",
};

export default async function CollectionsPage() {
  const collections = isShopifyEnabled() ? await getAllCollections() : [];

  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-10rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[28rem] w-[70rem] bg-gradient-to-r from-cyan-500 via-yellow-300 to-orange-500 opacity-25" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 sm:px-8 lg:px-12">
        <header className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
              Explore Collections
            </h1>
            <p className="max-w-3xl text-base text-foreground/70">
              Each collection is crafted with the community, channeling proceeds back
              into React Foundation grants, documentation, and education programs.
            </p>
          </div>
          {collections.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
              <span className="rounded-full border border-border/15 bg-background/5 px-4 py-2">
                {collections.length} {collections.length === 1 ? "collection" : "collections"}
              </span>
            </div>
          )}
        </header>

        <main className="space-y-12">
          {collections.length > 0 ? (
            <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-border/10 bg-muted/70 p-6 transition hover:border-border/25 hover:bg-muted"
                >
                  {collection.image ? (
                    <div className="relative h-48 overflow-hidden rounded-xl border border-border/10">
                      <Image
                        src={collection.image.url}
                        alt={collection.image.altText || collection.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 overflow-hidden rounded-xl border border-border/10 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="flex h-full items-center justify-center text-foreground/20">
                        <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                        {collection.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto text-xs text-sky-400 transition group-hover:text-sky-300">
                    View collection →
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <div className="rounded-2xl border border-border/10 bg-background/5 p-12 text-center">
              <p className="text-foreground/60">
                {isShopifyEnabled()
                  ? "No collections found. Add collections in your Shopify admin."
                  : "Shopify is not configured. Please set up your Shopify credentials."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

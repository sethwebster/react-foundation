"use client";

import Image from "next/image";
import Link from "next/link";

import type { ShopifyCollection } from "@/lib/shopify";

interface PastDropsCollectionsProps {
  collections: ShopifyCollection[];
}

export function PastDropsCollections({ collections }: PastDropsCollectionsProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <section id="past-drops" style={{ scrollMarginTop: "160px" }} className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-semibold text-foreground">Past Drops Archive</h2>
        <p className="text-sm text-foreground/60">
          Explore previous releases that funded React Foundation initiatives.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const dropLabel = collection.dropNumber
            ? `Drop ${collection.dropNumber.toString().padStart(2, '0')}`
            : 'Drop';
          const seasonYear = [collection.dropSeason, collection.dropYear]
            .filter(Boolean)
            .join(' ');
          const productCount = collection.products?.edges?.length || 0;

          return (
            <Link
              key={collection.id}
              href={`/store/collections/${collection.handle}`}
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
                  <div className="flex h-full items-center justify-center text-4xl font-bold text-foreground/10">
                    {collection.dropNumber?.toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-foreground/50">
                  {dropLabel && seasonYear && (
                    <span className="rounded-full border border-border/10 bg-background/5 px-2 py-0.5">
                      {dropLabel} · {seasonYear}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {collection.dropTheme || collection.title}
                </h3>

                {collection.description && (
                  <p className="line-clamp-2 text-sm text-foreground/60">
                    {collection.description}
                  </p>
                )}

                {collection.limitedEditionSize && (
                  <p className="text-xs text-foreground/40">
                    Limited edition of {collection.limitedEditionSize}
                  </p>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-foreground/40">
                  {productCount > 0 ? `${productCount}+ products` : 'View drop'}
                </span>
                <span className="text-xs text-sky-400 transition group-hover:text-sky-300">
                  View archive →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

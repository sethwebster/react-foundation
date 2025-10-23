"use client";

import Image from "next/image";
import Link from "next/link";

import type { ShopifyCollection } from "@/lib/shopify";
import { ButtonLink } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface FeaturedCollectionsProps {
  collections: ShopifyCollection[];
}

// Fallback for when Shopify is not configured
const fallbackCollections = [
  {
    id: "fallback-1",
    handle: "core-maintainer-essentials",
    title: "Core Maintainer Essentials",
    description: "Minimalist silhouettes in midnight hues with subtle React energy.",
    image: "/assets/collections/core-maintainer-essentials.png",
  },
  {
    id: "fallback-2",
    handle: "conference-spotlight",
    title: "Conference Spotlight Capsule",
    description: "Stage-ready tailoring with chromatic accents and crisp typography.",
    image: "/assets/collections/conference-spotlight.png",
  },
  {
    id: "fallback-3",
    handle: "oss-community-atelier",
    title: "OSS Community Atelier",
    description: "Collaborations with community artists celebrating open-source culture.",
    image: "/assets/collections/oss-community-atelier.png",
  },
];

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  // Filter and sort featured collections from Shopify
  const featuredCollections = collections.length > 0
    ? collections
        .filter((c) => c.homeFeatured)
        .sort((a, b) => (a.homeFeaturedOrder || 999) - (b.homeFeaturedOrder || 999))
        .slice(0, 3)
    : fallbackCollections;
  return (
    <section
      id="featured"
      style={{ scrollMarginTop: "160px" }}
      className="space-y-10 rounded-3xl border border-border/10 bg-background/5 p-10 backdrop-blur"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">
            Signature Collections
          </h2>
          <p className="mt-3 max-w-lg text-sm text-foreground/60">
            Build a wardrobe that champions open-source. Explore curated edits
            engineered for meetups, keynotes, and everyday hacking.
          </p>
        </div>
        <ButtonLink href="/store/collections" variant="ghost" size="sm">
          View all collections <span aria-hidden>→</span>
        </ButtonLink>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {featuredCollections.map((collection, index) => {
          const imageUrl = 'image' in collection && collection.image
            ? (typeof collection.image === 'string' ? collection.image : collection.image.url)
            : '/placeholders/collection-core.png';
          const imageAlt = 'image' in collection && collection.image && typeof collection.image === 'object'
            ? collection.image.altText || collection.title
            : `${collection.title} preview`;

          return (
            <ScrollReveal key={collection.id} animation="fade-up" delay={index * 100}>
              <Link
                href={`/store/collections/${collection.handle}`}
                className="flex flex-col gap-4 rounded-2xl border border-border/10 bg-muted/70 p-6 transition hover:border-border/25 hover:bg-muted"
              >
                <div className="relative h-40 overflow-hidden rounded-xl border border-border/10">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/60">
                    {collection.description}
                  </p>
                </div>
                <div className="mt-auto text-xs text-sky-400 transition hover:text-sky-300">
                  Shop the edit <span aria-hidden>→</span>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

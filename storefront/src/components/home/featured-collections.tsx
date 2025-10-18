"use client";

import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const collectionCards = [
  {
    title: "Core Maintainer Essentials",
    description:
      "Minimalist silhouettes in midnight hues with subtle React energy.",
    image: "/assets/collections/core-maintainer-essentials.png",
  },
  {
    title: "Conference Spotlight Capsule",
    description:
      "Stage-ready tailoring with chromatic accents and crisp typography.",
    image: "/assets/collections/conference-spotlight.png",
  },
  {
    title: "OSS Community Atelier",
    description:
      "Collaborations with community artists celebrating open-source culture.",
    image: "/assets/collections/oss-community-atelier.png",
  },
];

export function FeaturedCollections() {
  return (
    <section
      id="featured"
      style={{ scrollMarginTop: "160px" }}
      className="space-y-10 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Signature Collections
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/60">
            Build a wardrobe that champions open-source. Explore curated edits
            engineered for meetups, keynotes, and everyday hacking.
          </p>
        </div>
        <ButtonLink href="/collections" variant="ghost" size="sm">
          View all collections <span aria-hidden>→</span>
        </ButtonLink>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {collectionCards.map((collection, index) => (
          <ScrollReveal key={collection.title} animation="fade-up" delay={index * 100}>
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-white/25 hover:bg-slate-900">
            <div className="relative h-40 overflow-hidden rounded-xl border border-white/10">
              <Image
                src={collection.image}
                alt={`${collection.title} preview`}
                fill
                sizes="(min-width: 1024px) 25vw, 90vw"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {collection.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">
                {collection.description}
              </p>
            </div>
            <ButtonLink
              href="/collections"
              variant="ghost"
              size="sm"
              className="mt-auto"
            >
              Shop the edit <span aria-hidden>→</span>
            </ButtonLink>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

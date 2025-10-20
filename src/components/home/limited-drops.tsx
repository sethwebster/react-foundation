"use client";

import Image from "next/image";

import type { Product } from "@/lib/products";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getInventorySummary } from "@/lib/products-shopify";

interface LimitedDropsProps {
  heroProduct: Product | null;
  dropTiles: Product[];
}

export function LimitedDrops({ heroProduct, dropTiles }: LimitedDropsProps) {
  const heroImage = heroProduct?.primaryImage;
  const heroInventory = heroProduct ? getInventorySummary(heroProduct) : null;

  return (
    <section id="drops" style={{ scrollMarginTop: "160px" }} className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-semibold text-white">Limited Drops</h2>
        <p className="text-sm text-white/60">
          Micro-batches, numbered pieces, collabs with the React core team.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/50 via-purple-500/30 to-slate-900 p-8">
          <div className="relative mb-6 h-48 overflow-hidden rounded-2xl border border-white/15">
            {heroImage ? (
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1024px) 420px, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${heroImage.centerOffset.x} ${heroImage.centerOffset.y}`,
                }}
                priority
              />
            ) : (
              <Image
                src="/placeholders/drop-fiber.png"
                alt="Fiber jacket concept art"
                fill
                sizes="(min-width: 1024px) 420px, 100vw"
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="space-y-1">
            {heroInventory ? (
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">
                {heroInventory.inventoryLabel} · {heroInventory.availabilityLabel}
              </p>
            ) : null}
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              {heroProduct?.releaseWindow ?? "Next in queue"}
            </p>
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white">
            {heroProduct?.name ?? "The Fiber Jacket"}
          </h3>
          <p className="mt-3 text-sm text-indigo-100/80">
            {heroProduct?.tagline ??
              "A technical shell engineered with seam-sealed pockets, hidden QR code storytelling, and NFC souvenir tag."}
          </p>
          <div className="mt-6 space-y-2 text-xs text-white/70">
            <p>{heroProduct?.status ?? "Preorders open • Feb 18"}</p>
            <p>
              {heroProduct?.highlights[0] ??
                "Edition of 400 · Includes digital collectible"}
            </p>
          </div>
          <ButtonLink
            href={heroProduct ? `/products/${heroProduct.slug}` : "#drops"}
            size="xs"
            className="mt-8"
          >
            Preview Details
          </ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {dropTiles.map((product, index) => (
            <ScrollReveal key={product.slug} animation="fade-up" delay={index * 150}>
              <ProductCard
                product={product}
                href={`/products/${product.slug}`}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

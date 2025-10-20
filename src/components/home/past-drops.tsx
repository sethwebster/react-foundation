"use client";

import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ui/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface PastDropsProps {
  products: Product[];
}

export function PastDrops({ products }: PastDropsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="past-drops" style={{ scrollMarginTop: "160px" }} className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-semibold text-white">Past Drops Archive</h2>
        <p className="text-sm text-white/60">
          Explore the releases that funded previous React Foundation initiatives.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => (
          <ScrollReveal key={product.slug} animation="fade-up" delay={index * 100}>
            <ProductCard
              product={product}
              href={`/store/products/${product.slug}`}
              ctaLabel="View archive"
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

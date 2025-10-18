import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/ui/product-card";

interface PastDropsProps {
  products: Product[];
}

export function PastDrops({ products }: PastDropsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="past-drops" className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-semibold text-white">Past Drops Archive</h2>
        <p className="text-sm text-white/60">
          Explore the releases that funded previous React Foundation initiatives.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            href={`/products/${product.slug}`}
            ctaLabel="View archive"
          />
        ))}
      </div>
    </section>
  );
}

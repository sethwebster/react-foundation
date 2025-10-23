import Image from "next/image";
import Link from "next/link";

import { Rating } from "@/components/ui/rating";
import { getInventorySummary } from "@/lib/products";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  href: string;
  ctaLabel?: string;
};

export function ProductCard({
  product,
  href,
  ctaLabel = "View drop",
}: ProductCardProps) {
  const previewImage = product.primaryImage;
  const objectPosition = `${previewImage.centerOffset.x} ${previewImage.centerOffset.y}`;
  const { inventoryLabel, availabilityLabel } = getInventorySummary(product);

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card/70 p-6 transition hover:border-border/60 hover:bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="relative h-32 overflow-hidden rounded-xl border border-border">
        <Image
          src={previewImage.src}
          alt={previewImage.alt}
          fill
          sizes="(min-width: 1024px) 200px, 90vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          style={{ objectPosition }}
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-card-foreground">{product.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {product.price}
        </span>
      </div>
      <Rating
        value={product.rating}
        count={product.ratingCount}
        className="mt-1"
      />
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/60">
          {inventoryLabel} · {availabilityLabel}
        </p>
        <p className="text-xs text-foreground/40">{product.status}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-indigo-100 transition group-hover:text-foreground">
        {ctaLabel} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

import type { Product } from "@/lib/products";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { Rating } from "@/components/ui/rating";

interface HeroProps {
  heroProduct: Product | null;
}

export function Hero({ heroProduct }: HeroProps) {
  return (
    <div className="space-y-8">
      <Pill>{heroProduct?.releaseWindow ?? "Drop 05 · Winter 2025"}</Pill>
      <div>
        <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
          Fund the React Foundation in style.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-foreground/70">
          Premium gear designed with the community, for the community. Every
          purchase accelerates open-source sustainability and React education
          worldwide.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="/store/collections" variant="primary">
          Explore the Collection
        </ButtonLink>
        <ButtonLink href="/store#impact" variant="secondary">
          Watch the Story
        </ButtonLink>
      </div>
      {heroProduct ? (
        <Rating
          value={heroProduct.rating}
          count={heroProduct.ratingCount}
          size="md"
          className="mt-2"
        />
      ) : null}
      <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-foreground/50">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-success/50" />
          Built for Devs
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-primary/50" />
          Carbon Neutral
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-destructive/50" />
          Profits → Foundation
        </div>
      </div>
    </div>
  );
}

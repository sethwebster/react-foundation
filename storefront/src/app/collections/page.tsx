import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ProductCard } from "@/components/ui/product-card";
import { getDropProducts } from "@/lib/products-shopify";

export const metadata: Metadata = {
  title: "Collections Overview",
  description:
    "Curated React Foundation drops, collaborations, and essentials that power open-source innovation.",
};

export default async function CollectionsPage() {
  const dropProducts = await getDropProducts();
  return (
    <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
      <div className="absolute inset-x-0 top-[-10rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[28rem] w-[70rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 opacity-25" />
      </div>
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-16 px-6 pb-24 sm:px-8 lg:px-12">
        <header className="space-y-6">
          <Pill tone="sky" className="bg-white/10 text-white/80">
            Curated React drops
          </Pill>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              Explore the collection.
            </h1>
            <p className="max-w-3xl text-base text-white/70">
              Each piece is crafted with the community, channeling proceeds back
              into React Foundation grants, documentation, and education
              programs. Discover limited runs, studio collaborations, and core
              maintainer essentials.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              Limited drops · {dropProducts.length} products
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              New releases every quarter
            </span>
            <ButtonLink href="/#impact" variant="ghost" size="sm">
              See how funds are invested →
            </ButtonLink>
          </div>
        </header>

        <main className="space-y-12">
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dropProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                href={`/products/${product.slug}`}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

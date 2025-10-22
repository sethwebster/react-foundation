import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/ui/product-card";
import { getProductsByCollection } from "@/lib/products-shopify";
import { getAllCollections, getDropStatus, isShopifyEnabled } from "@/lib/shopify";

type CollectionPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;

  if (!isShopifyEnabled()) {
    return {
      title: "Collection",
      description: "Browse our collection",
    };
  }

  const collections = await getAllCollections();
  const collection = collections.find((c) => c.handle === handle);

  if (!collection) {
    return {
      title: "Store - Collection not found",
      description: "We couldn't find that collection.",
    };
  }

  return {
    title: `Store - ${collection.title}`,
    description: collection.description || `Browse the ${collection.title} collection`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;

  // Fetch collection details and products
  const [collections, products] = await Promise.all([
    isShopifyEnabled() ? getAllCollections() : [],
    getProductsByCollection(handle),
  ]);

  const collection = collections.find((c) => c.handle === handle);

  if (!collection && products.length === 0) {
    notFound();
  }

  // Calculate drop status if it's a drop collection
  const dropStatus = collection?.isDrop ? getDropStatus(collection) : null;
  const dropLabel = collection?.dropNumber
    ? `Drop ${collection.dropNumber.toString().padStart(2, '0')}`
    : null;
  const seasonYear = collection
    ? [collection.dropSeason, collection.dropYear].filter(Boolean).join(' ')
    : null;

  return (
    <div className="min-h-screen bg-background pt-24 text-muted-foreground">
      <div className="absolute inset-x-0 top-[-10rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[28rem] w-[70rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 opacity-25" />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 sm:px-8 lg:px-12">
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            {dropStatus && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  dropStatus === 'current'
                    ? 'bg-success/20 text-emerald-300'
                    : dropStatus === 'upcoming'
                    ? 'bg-primary/20 text-sky-300'
                    : 'bg-background/10 text-foreground/50'
                }`}
              >
                {dropStatus}
              </span>
            )}
            {collection?.isDrop && dropLabel && seasonYear && (
              <span className="text-sm text-foreground/50">
                {dropLabel} · {seasonYear}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
              {collection?.dropTheme || collection?.title || 'Collection'}
            </h1>
            {collection?.description && (
              <p className="max-w-3xl text-base text-foreground/70">
                {collection.description}
              </p>
            )}
          </div>

          {collection?.limitedEditionSize && (
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <span className="rounded-full border border-border/15 bg-background/5 px-4 py-2">
                Limited edition of {collection.limitedEditionSize}
              </span>
            </div>
          )}

          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/60">
              <span className="rounded-full border border-border/15 bg-background/5 px-4 py-2">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          )}
        </header>

        <main className="space-y-12">
          {products.length > 0 ? (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  href={`/store/products/${product.slug}`}
                />
              ))}
            </section>
          ) : (
            <div className="rounded-2xl border border-border/10 bg-background/5 p-12 text-center">
              <p className="text-foreground/60">
                No products in this collection yet. Check back soon!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

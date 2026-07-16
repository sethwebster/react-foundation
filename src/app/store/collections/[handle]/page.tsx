import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PageIntro,
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ProductCard } from "@/components/ui/product-card";
import { getProductsByCollection } from "@/lib/products-shopify";
import { getAllCollections, isShopifyEnabled } from "@/lib/shopify";

type CollectionPageProps = {
  params: Promise<{ handle: string }>;
};

function titleFromHandle(handle: string) {
  return handle
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: titleFromHandle(handle),
    description: "Preview this React Foundation store collection.",
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params;
  const [collections, products] = await Promise.all([
    isShopifyEnabled() ? getAllCollections() : [],
    getProductsByCollection(handle),
  ]);
  const collection = collections.find((item) => item.handle === handle);

  if (!collection && products.length === 0) notFound();

  const title = collection?.dropTheme || collection?.title || titleFromHandle(handle);

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-12 sm:pt-16" measure="standard">
          <Link
            href="/store/collections"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span> All collections
          </Link>
        </Section>
        <Section className="pt-10" measure="standard">
          <PageIntro
            align="left"
            eyebrow="Store preview"
            title={title}
            description={
              collection?.description ||
              "Products in this collection are shown for preview. Checkout is not currently available."
            }
          />
        </Section>

        <Section className="py-16" measure="standard">
          {products.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  href={`/store/products/${product.slug}`}
                />
              ))}
            </div>
          ) : (
            <Surface className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No product previews are available for this collection.
              </p>
            </Surface>
          )}
        </Section>
      </main>
    </PublicPageShell>
  );
}

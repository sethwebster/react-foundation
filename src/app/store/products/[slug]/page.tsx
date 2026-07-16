import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PublicPageShell,
  Section,
  Surface,
} from "@/components/public-site/layout";
import { ProductGallery } from "@/components/ui/product-gallery";
import { getInventorySummary, getProductBySlug } from "@/lib/products-shopify";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product
    ? { title: product.name, description: product.description }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const inventory = getInventorySummary(product);

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-12 sm:pt-16" measure="standard">
          <Link
            href="/store/collections"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span> Store collections
          </Link>
        </Section>

        <Section className="pt-10" measure="standard">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Surface className="p-4 sm:p-7">
              <ProductGallery images={product.images} />
            </Surface>

            <div>
              <p className="text-sm font-semibold text-primary">Store preview</p>
              <h1 className="mt-4 text-title font-semibold leading-tight text-foreground">
                {product.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground">
                {product.tagline}
              </p>
              <p className="mt-6 text-sm leading-6 text-muted-foreground">
                {product.description}
              </p>

              <dl className="mt-8 divide-y divide-border border-y border-border">
                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted-foreground">Preview price</dt>
                  <dd className="font-semibold text-foreground">{product.price}</dd>
                </div>
                <div className="flex justify-between gap-4 py-4 text-sm">
                  <dt className="text-muted-foreground">Availability</dt>
                  <dd className="text-right text-foreground">
                    {inventory.availabilityLabel}
                  </dd>
                </div>
              </dl>

              <Surface className="mt-8 p-5 shadow-none">
                <h2 className="text-base font-semibold text-foreground">
                  Checkout is not currently available
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Product details may change before the store opens. No order or
                  waitlist registration is created from this preview.
                </p>
              </Surface>
            </div>
          </div>
        </Section>

        <Section className="py-16" measure="standard">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Features</h2>
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {product.features.map((feature) => (
                  <li key={feature} className="py-4 text-sm text-muted-foreground">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Details</h2>
              <dl className="mt-5 divide-y divide-border border-y border-border">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-4 text-sm"
                  >
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-foreground">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

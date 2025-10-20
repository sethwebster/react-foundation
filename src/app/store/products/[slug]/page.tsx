import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGallery } from "@/components/ui/product-gallery";
import { Rating } from "@/components/ui/rating";
import {
  getProductBySlug,
  getRelatedProducts,
  getInventorySummary,
} from "@/lib/products-shopify";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Note: generateStaticParams removed - products are fetched dynamically from Shopify
// For static generation at build time, you'd need to fetch all products from Shopify

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Store - Product not found",
      description: "We couldn't find that React Foundation product.",
    };
  }

  return {
    title: `Store - ${product.name}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 4).map((image) => ({
        url: image.src,
        alt: image.alt,
      })),
    },
    twitter: {
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1).map((image) => image.src),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const inventorySummary = getInventorySummary(product);
  const relatedProducts = await getRelatedProducts(product.slug);

  return (
    <div className="relative min-h-screen bg-slate-950 pt-24 text-slate-100">
      <div
        className={`pointer-events-none absolute inset-0 blur-3xl`}
        aria-hidden
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${product.accent} opacity-25`}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 pb-24 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between text-sm text-white/60">
          <ButtonLink
            href="/store#drops"
            variant="secondary"
            size="xs"
            className="px-3"
          >
            <span aria-hidden>←</span> Back to store
          </ButtonLink>
          <span className="uppercase tracking-[0.3em] text-white/40">
            {product.releaseWindow}
          </span>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-10">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 sm:p-8">
              <ProductGallery
                images={product.images}
                className="mx-auto max-w-[520px]"
              />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">
                      {inventorySummary.availabilityLabel}
                    </p>
                    <p className="text-xs text-white/60">{inventorySummary.inventoryLabel}</p>
                  </div>
                  <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
                    {product.name}
                  </h1>
                  <p className="mt-3 text-base text-white/70">
                    {product.tagline}
                  </p>
                  <Rating
                    value={product.rating}
                    count={product.ratingCount}
                    size="md"
                    className="mt-4"
                  />
                </div>
                <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                  {product.price}
                </div>
              </div>
            </div>

            <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
              <h2 className="text-xl font-semibold text-white">
                Built for the React community
              </h2>
              <p className="text-sm text-white/70">{product.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-sm text-white/80">{feature}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Why it matters
                </h3>
                <ul className="space-y-3 text-sm text-white/70">
                  {product.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/70">
                <p className="font-semibold text-white/80">
                  Impact guarantee
                </p>
                <p className="mt-3">
                  The React Foundation publishes quarterly reports detailing how
                  merch revenue supports maintainers, education, and accessibility
                  initiatives. Every purchase is fully transparent.
                </p>
              </aside>
            </section>
          </div>

          <aside className="space-y-8 rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Drop support tier
              </p>
              <p className="mt-4 text-sm text-white/70">
                Secure your piece and we will notify you as soon as the checkout
                experience is live.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/70">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-sm text-white/80">{spec.value}</p>
                </div>
              ))}
            </div>
            <ButtonLink
              href="/#drops"
              className="w-full"
            >
              Join the waitlist
            </ButtonLink>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
              <p>
                Need sizing help? Email{" "}
                <a
                  href="mailto:shop@react.foundation"
                  className="text-indigo-200 hover:text-white"
                >
                  shop@react.foundation
                </a>{" "}
                for a tailored fit recommendation.
              </p>
            </div>
          </aside>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">
                More limited drops
              </h2>
              <ButtonLink
                href="/store#drops"
                variant="ghost"
                size="sm"
              >
                View all drops →
              </ButtonLink>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.slug}
                  product={related}
                  href={`/store/products/${related.slug}`}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

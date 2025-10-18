import Image from "next/image";

import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ProductCard } from "@/components/ui/product-card";
import { Rating } from "@/components/ui/rating";
import { MaintainerProgressProvider } from "@/features/maintainer-progress/context";
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
import { SignInButton } from "@/features/auth/sign-in-button";
import {
  getProductBySlug,
  getProductsByCollection,
  getInventorySummary,
} from "@/lib/products-shopify";

const collectionCards = [
  {
    title: "Core Maintainer Essentials",
    description:
      "Minimalist silhouettes in midnight hues with subtle React energy.",
    image: "/assets/collections/core-maintainer-essentials.png",
  },
  {
    title: "Conference Spotlight Capsule",
    description:
      "Stage-ready tailoring with chromatic accents and crisp typography.",
    image: "/assets/collections/conference-spotlight.png",
  },
  {
    title: "OSS Community Atelier",
    description:
      "Collaborations with community artists celebrating open-source culture.",
    image: "/assets/collections/oss-community-atelier.png",
  },
];

export default async function Home() {
  // Fetch products from Shopify
  const [currentDropProducts, pastDropProducts, heroProduct] = await Promise.all([
    getProductsByCollection("current-drop"),
    getProductsByCollection("past-drop"),
    getProductBySlug("fiber-shell"),
  ]);

  const heroProductFinal = heroProduct ?? currentDropProducts[0] ?? null;
  const dropTiles = currentDropProducts
    .filter((product) => product.slug !== heroProductFinal?.slug)
    .slice(0, 4);

  const heroImage = heroProductFinal?.primaryImage;
  const heroInventory = heroProductFinal
    ? getInventorySummary(heroProductFinal)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
      </div>
      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-24 pt-10 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
              <Image
                src="/react-logo.svg"
                alt="React Foundation logo"
                fill
                sizes="40px"
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/60">
                React Foundation
              </p>
              <p className="text-base font-medium text-white">Official Storefront</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/70">
            <nav className="flex items-center gap-6">
              <a className="hover:text-white transition" href="#featured">
                Collections
              </a>
              <a className="hover:text-white transition" href="#drops">
                Limited Drops
              </a>
              <a className="hover:text-white transition" href="#impact">
                Impact
              </a>
            </nav>
            <SignInButton />
            <Button
              variant="glass"
              size="sm"
              className="px-4"
              type="button"
            >
              Cart (0)
            </Button>
          </div>
        </header>

        <MaintainerProgressProvider>
          <main className="mt-16 flex flex-1 flex-col gap-20">
          <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-8">
              <Pill>{heroProductFinal?.releaseWindow ?? "Drop 05 · Winter 2025"}</Pill>
              <div>
                <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl">
                  Fund the React Foundation in style.
                </h1>
                <p className="mt-6 max-w-xl text-lg text-white/70">
                  Premium gear designed with the community, for the community.
                  Every purchase accelerates open-source sustainability and React
                  education worldwide.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <ButtonLink href="/collections" variant="primary">
                  Explore the Collection
                </ButtonLink>
                <ButtonLink
                  href="#impact"
                  variant="secondary"
                >
                  Watch the Story
                </ButtonLink>
              </div>
              {heroProductFinal ? (
                <Rating
                  value={heroProductFinal.rating}
                  count={heroProductFinal.ratingCount}
                  size="md"
                  className="mt-2"
                />
              ) : null}
              <div className="flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-white/50">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-emerald-400" />
                  Built for Devs
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-sky-400" />
                  Carbon Neutral
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 bg-rose-400" />
                  Profits → Foundation
                </div>
              </div>
            </div>
            <div className="relative h-96 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
              <div className="absolute inset-x-6 top-6 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-indigo-500/20">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <p>Featured Look</p>
                  <p>React Summit Capsule</p>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10">
                    <Image
                      src="/placeholders/collection-core.png"
                      alt="React Summit capsule collection hero garment"
                      fill
                      sizes="(min-width: 1024px) 320px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative h-24 overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src="/placeholders/collection-conference.png"
                        alt="Detail of the conference spotlight capsule piece"
                        fill
                        sizes="(min-width: 1024px) 150px, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="relative h-24 overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src="/placeholders/collection-atelier.png"
                        alt="Open source community atelier collaboration artwork"
                        fill
                        sizes="(min-width: 1024px) 150px, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-white/70">
                  <p>Ships globally</p>
                  <ButtonLink
                    href={heroProductFinal ? `/products/${heroProductFinal.slug}` : "#drops"}
                    variant="secondary"
                    size="xs"
                    className="px-4"
                  >
                    Preview drop →
                  </ButtonLink>
                </div>
              </div>
              <div className="absolute -right-12 bottom-6 h-52 w-52 rounded-full bg-gradient-to-b from-indigo-500/40 to-blue-400/40 blur-3xl" />
              <div className="absolute -left-16 top-20 h-36 w-36 rounded-full bg-gradient-to-b from-rose-400/30 to-amber-400/30 blur-3xl" />
            </div>
          </section>

          <MaintainerProgress />

          <section
            id="featured"
            className="space-y-10 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  Signature Collections
                </h2>
                <p className="mt-3 max-w-lg text-sm text-white/60">
                  Build a wardrobe that champions open-source. Explore curated
                  edits engineered for meetups, keynotes, and everyday hacking.
                </p>
              </div>
              <ButtonLink href="/collections" variant="ghost" size="sm">
                View all collections <span aria-hidden>→</span>
              </ButtonLink>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {collectionCards.map((collection) => (
                <div
                  key={collection.title}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6 transition hover:border-white/25 hover:bg-slate-900"
                >
                  <div className="relative h-40 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={collection.image}
                      alt={`${collection.title} preview`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {collection.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">
                      {collection.description}
                    </p>
                  </div>
                  <ButtonLink
                    href="/collections"
                    variant="ghost"
                    size="sm"
                    className="mt-auto"
                  >
                    Shop the edit <span aria-hidden>→</span>
                  </ButtonLink>
                </div>
              ))}
            </div>
          </section>

          <section id="drops" className="space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-3xl font-semibold text-white">
                Limited Drops
              </h2>
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
                    {heroProductFinal?.releaseWindow ?? "Next in queue"}
                  </p>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {heroProductFinal?.name ?? "The Fiber Jacket"}
                </h3>
                <p className="mt-3 text-sm text-indigo-100/80">
                  {heroProductFinal?.tagline ??
                    "A technical shell engineered with seam-sealed pockets, hidden QR code storytelling, and NFC souvenir tag."}
                </p>
                <div className="mt-6 space-y-2 text-xs text-white/70">
                  <p>{heroProductFinal?.status ?? "Preorders open • Feb 18"}</p>
                  <p>
                    {heroProductFinal?.highlights[0] ??
                      "Edition of 400 · Includes digital collectible"}
                  </p>
                </div>
                <ButtonLink
                  href={heroProductFinal ? `/products/${heroProductFinal.slug}` : "#drops"}
                  size="xs"
                  className="mt-8"
                >
                  Preview Details
                </ButtonLink>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {dropTiles.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    href={`/products/${product.slug}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {pastDropProducts.length > 0 ? (
            <section id="past-drops" className="space-y-10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-3xl font-semibold text-white">
                  Past Drops Archive
                </h2>
                <p className="text-sm text-white/60">
                  Explore the releases that funded previous React Foundation initiatives.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastDropProducts.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    href={`/products/${product.slug}`}
                    ctaLabel="View archive"
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section
            id="impact"
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 backdrop-blur"
          >
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-white">
                  Every cart funds React ecosystems.
                </h2>
                <p className="text-sm text-white/60">
                  100% of proceeds fuel React Foundation grants, documentation,
                  education, and community-led innovation. We publish transparent
                  impact reports each quarter, so you can see which projects your
                  wardrobe supports.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      label: "Open Source Grants",
                      value: "$2.4M",
                      caption: "funded since 2023",
                    },
                    {
                      label: "Docs Translations",
                      value: "18",
                      caption: "languages supported",
                    },
                    {
                      label: "Scholarships",
                      value: "320",
                      caption: "students sponsored",
                    },
                    {
                      label: "Community Events",
                      value: "95",
                      caption: "meetups underwritten",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/60">{stat.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-slate-900 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  React Foundation Journal
                </p>
                <p className="mt-4 text-lg font-medium text-white">
                  “Swag sales helped us fund 12 new documentation maintainers
                  this quarter. The community voted, we shipped.”
                </p>
                <p className="mt-8 text-sm text-white/60">
                  Read more impact stories →
                </p>
              </div>
            </div>
          </section>
          </main>
        </MaintainerProgressProvider>

        <footer className="mt-20 border-t border-white/10 pt-8 text-sm text-white/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} React Foundation. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              <a className="hover:text-white transition" href="#privacy">
                Privacy
              </a>
              <a className="hover:text-white transition" href="#terms">
                Terms
              </a>
              <a className="hover:text-white transition" href="#accessibility">
                Accessibility
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

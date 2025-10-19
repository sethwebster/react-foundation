import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { FeaturedLook } from "@/components/home/featured-look";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { LimitedDrops } from "@/components/home/limited-drops";
import { PastDropsCollections } from "@/components/home/past-drops-collections";
import { MaintainerProgressProvider } from "@/features/maintainer-progress/context";
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
import { ImpactSection } from "@/features/impact/impact-section";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getProductBySlug, getProductsByCollection } from "@/lib/products-shopify";
import {
  getAllCollections,
  getCurrentDrops,
  getPastDrops,
  isShopifyEnabled,
} from "@/lib/shopify";

export default async function Home() {
  // Fetch all collections from Shopify
  const allCollections = isShopifyEnabled() ? await getAllCollections() : [];

  console.log('[Home] All collections:', allCollections.length);
  console.log('[Home] Collections with isDrop:', allCollections.filter(c => c.isDrop));

  // Filter collections by type
  const currentDropCollections = getCurrentDrops(allCollections);
  const pastDropCollections = getPastDrops(allCollections);

  console.log('[Home] Current drops:', currentDropCollections);
  console.log('[Home] Past drops:', pastDropCollections);

  // Get the primary current drop collection
  const primaryDrop = currentDropCollections[0];

  // Fetch products from the primary current drop (or fallback to old system)
  const [currentDropProducts, heroProduct] = await Promise.all([
    primaryDrop
      ? getProductsByCollection(primaryDrop.handle)
      : getProductsByCollection("current-drop"), // Fallback
    getProductBySlug("fiber-shell"),
  ]);

  const heroProductFinal = heroProduct ?? currentDropProducts[0] ?? null;
  const dropTiles = currentDropProducts
    .filter((product) => product.slug !== heroProductFinal?.slug)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 text-slate-100">
      <div className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
      </div>

      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-24 sm:px-8 lg:px-12">
        <MaintainerProgressProvider>
          <main className="flex flex-1 flex-col gap-20">
            <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
              <Hero heroProduct={heroProductFinal} />
              <FeaturedLook products={currentDropProducts} />
            </section>

            <ScrollReveal animation="fade-up">
              <FeaturedCollections collections={allCollections} />
            </ScrollReveal>

            <ScrollReveal animation="scale">
              <LimitedDrops heroProduct={heroProductFinal} dropTiles={dropTiles} />
            </ScrollReveal>

            <ScrollReveal animation="fade-up">
              <PastDropsCollections collections={pastDropCollections} />
            </ScrollReveal>

            <ScrollReveal animation="fade-up">
              <MaintainerProgress />
            </ScrollReveal>

            <ScrollReveal animation="scale">
              <ImpactSection />
            </ScrollReveal>
          </main>
        </MaintainerProgressProvider>
      </div>

      <Footer />
    </div>
  );
}

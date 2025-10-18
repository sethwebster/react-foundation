import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { FeaturedLook } from "@/components/home/featured-look";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { LimitedDrops } from "@/components/home/limited-drops";
import { PastDrops } from "@/components/home/past-drops";
import { MaintainerProgressProvider } from "@/features/maintainer-progress/context";
import { MaintainerProgress } from "@/features/maintainer-progress/maintainer-progress";
import { ImpactSection } from "@/features/impact/impact-section";
import { Parallax } from "@/components/ui/parallax";
import { getProductBySlug, getProductsByCollection } from "@/lib/products-shopify";

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Parallax speed={0.2} direction="down" className="absolute inset-x-0 top-[-6rem] -z-10 flex justify-center blur-3xl">
        <div className="h-[24rem] w-[60rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30" />
      </Parallax>

      <Header />

      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-24 pt-24 sm:px-8 lg:px-12">
        <MaintainerProgressProvider>
          <main className="flex flex-1 flex-col gap-20">
            <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
              <Hero heroProduct={heroProductFinal} />
              <FeaturedLook products={currentDropProducts} />
            </section>

            <FeaturedCollections />

            <LimitedDrops heroProduct={heroProductFinal} dropTiles={dropTiles} />

            <PastDrops products={pastDropProducts} />

            <MaintainerProgress />

            <ImpactSection />
          </main>
        </MaintainerProgressProvider>
      </div>

      <Footer />
    </div>
  );
}

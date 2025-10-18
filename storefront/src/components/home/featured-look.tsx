import Image from "next/image";

import type { Product } from "@/lib/products";
import { ButtonLink } from "@/components/ui/button";

interface FeaturedLookProps {
  products: Product[];
}

export function FeaturedLook({ products }: FeaturedLookProps) {
  // Use first 3 products for the featured look showcase
  const mainProduct = products[0];
  const sideProducts = products.slice(1, 3);

  return (
    <div className="relative h-[32rem] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
      <div className="absolute inset-x-6 top-6 rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-indigo-500/20">
        <div className="flex items-center justify-between text-xs text-white/60">
          <p>Featured Look</p>
          <p>React Summit Capsule</p>
        </div>
        <div className="mt-6 grid gap-4">
          {/* Main featured product image */}
          {mainProduct?.primaryImage ? (
            <div className="relative h-36 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={mainProduct.primaryImage.src}
                alt={mainProduct.primaryImage.alt}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover"
                style={{
                  objectPosition: `${mainProduct.primaryImage.centerOffset.x} ${mainProduct.primaryImage.centerOffset.y}`,
                }}
                priority
              />
            </div>
          ) : (
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
          )}

          {/* Side product images grid */}
          <div className="grid grid-cols-2 gap-4">
            {sideProducts.map((product, index) =>
              product?.primaryImage ? (
                <div
                  key={product.slug}
                  className="relative h-24 overflow-hidden rounded-xl border border-white/10"
                >
                  <Image
                    src={product.primaryImage.src}
                    alt={product.primaryImage.alt}
                    fill
                    sizes="(min-width: 1024px) 150px, 50vw"
                    className="object-cover"
                    style={{
                      objectPosition: `${product.primaryImage.centerOffset.x} ${product.primaryImage.centerOffset.y}`,
                    }}
                  />
                </div>
              ) : (
                <div
                  key={`placeholder-${index}`}
                  className="relative h-24 overflow-hidden rounded-xl border border-white/10"
                >
                  <Image
                    src={
                      index === 0
                        ? "/placeholders/collection-conference.png"
                        : "/placeholders/collection-atelier.png"
                    }
                    alt={
                      index === 0
                        ? "Detail of the conference spotlight capsule piece"
                        : "Open source community atelier collaboration artwork"
                    }
                    fill
                    sizes="(min-width: 1024px) 150px, 50vw"
                    className="object-cover"
                  />
                </div>
              )
            )}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-white/70">
          <p>Ships globally</p>
          <ButtonLink
            href={mainProduct ? `/products/${mainProduct.slug}` : "#drops"}
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
  );
}

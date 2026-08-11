import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  PageIntro,
  PublicPageShell,
  Section,
} from "@/components/public-site/layout";
import { getAllCollections, isShopifyEnabled } from "@/lib/shopify";

const fallbackCollections = [
  {
    id: "current-drop",
    handle: "current-drop",
    title: "Current drop",
    description: "A preview of the planned current collection.",
    image: null,
  },
  {
    id: "past-drop",
    handle: "past-drop",
    title: "Archive",
    description: "Previous merchandise concepts and releases.",
    image: null,
  },
];

export const metadata: Metadata = {
  title: "Store Collections",
  description: "Preview React Foundation merchandise collections.",
};

export default async function CollectionsPage() {
  const collections = isShopifyEnabled()
    ? await getAllCollections()
    : fallbackCollections;

  return (
    <PublicPageShell>
      <main>
        <Section className="pt-16 sm:pt-24" measure="standard">
          <PageIntro
            align="left"
            eyebrow="Store preview"
            title="Store collections"
            description="Preview planned and archived merchandise. Checkout is not currently available."
          />
        </Section>

        <Section className="py-16 sm:py-20" measure="standard">
          <div className="grid gap-px overflow-hidden rounded-panel border border-border bg-border sm:grid-cols-2">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/store/collections/${collection.handle}`}
                className="group bg-background p-7 transition hover:bg-muted sm:p-9"
              >
                {collection.image ? (
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-card bg-muted">
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    aria-hidden
                    className="mb-6 flex aspect-[4/3] items-end rounded-card bg-muted p-5 text-5xl font-semibold text-border-strong"
                  >
                    {collection.title.charAt(0)}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-foreground">
                  {collection.title}
                </h2>
                {collection.description ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {collection.description}
                  </p>
                ) : null}
                <p className="mt-5 text-sm font-semibold text-primary">
                  View collection <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </Section>
      </main>
    </PublicPageShell>
  );
}

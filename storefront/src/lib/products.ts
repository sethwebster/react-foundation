import productData from "./products.json";

type ProductSource = (typeof productData)["products"][number];
type ProductImageSource = ProductSource["images"][number];

export type ProductImage = ProductImageSource & {
  centerOffset: NonNullable<ProductImageSource["centerOffset"]>;
};

export type ProductCategory = ProductSource["category"];
export type ProductCollection = ProductSource["collections"][number];
export type ProductAvailability = ProductSource["availability"];

export type Product = Omit<ProductSource, "images"> & {
  images: ProductImage[];
  primaryImage: ProductImage;
};

const CENTER_FALLBACK: ProductImage["centerOffset"] = {
  x: "50%",
  y: "50%",
};

export const products: Product[] = productData.products.map((product) => {
  const images: ProductImage[] = product.images.map((image) => ({
    ...image,
    centerOffset: image.centerOffset ?? CENTER_FALLBACK,
  }));

  const primaryImage =
    images.find((image) => image.id === product.primaryImageId) ?? images[0];

  if (!primaryImage) {
    throw new Error(`Product "${product.slug}" must include at least one image.`);
  }

  return {
    ...product,
    images,
    primaryImage,
  };
});

export function getProductBySlug(slug: string): Product | null {
  return products.find((product) => product.slug === slug) ?? null;
}

export function getDropProducts(): Product[] {
  return products.filter((product) => product.category === "drop");
}

export function getProductsByCollection(collection: ProductCollection): Product[] {
  return products.filter((product) => product.collections.includes(collection));
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const originProduct = getProductBySlug(slug);

  const pool = originProduct
    ? getProductsByCollection(
        originProduct.collections[0] ?? ("current-drop" as ProductCollection),
      )
    : getDropProducts();

  return pool
    .filter((product) => product.slug !== slug)
    .slice(0, limit);
}

const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  available: "Available",
  backordered: "Backordered",
  discontinued: "Discontinued",
};

export function formatAvailability(availability: ProductAvailability): string {
  return AVAILABILITY_LABELS[availability] ?? availability;
}

export function getInventorySummary(product: Pick<Product, "quantityAvailable" | "availability">) {
  const qty = product.quantityAvailable;

  // For print-on-demand or high-quantity items (likely unlimited)
  if (qty >= 999) {
    return {
      availabilityLabel: 'In stock',
      inventoryLabel: 'Made to order',
    };
  }

  // Determine single clear status
  if (product.availability === 'backordered') {
    return {
      availabilityLabel: 'Backordered',
      inventoryLabel: qty > 0 ? `${qty} on backorder` : 'Accepting preorders',
    };
  }

  if (product.availability === 'discontinued') {
    return {
      availabilityLabel: 'Discontinued',
      inventoryLabel: qty > 0 ? `${qty} remaining` : 'No longer available',
    };
  }

  // Available status
  if (qty === 0) {
    return {
      availabilityLabel: 'Sold out',
      inventoryLabel: 'Check back soon',
    };
  }

  if (qty <= 5) {
    return {
      availabilityLabel: 'Low stock',
      inventoryLabel: `Only ${qty} left`,
    };
  }

  return {
    availabilityLabel: 'In stock',
    inventoryLabel: `${qty} available`,
  };
}

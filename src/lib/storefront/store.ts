import "server-only";

import { cache } from "react";

import { buildCategories, categoryImageMap, normalizeCategories, productsInCategory } from "./catalog";
import { StorefrontError, getCatalog, getStoreInfo, media } from "./client";
import { normalizeBanners } from "./presentation";
import type { CatalogResponse, Category, Product, StoreBanner, StoreInfo } from "./types";

import { BRAND } from "@/config/store";

/**
 * Why the storefront has no data. A rejected key needs a person to fix the
 * configuration; a network blip resolves itself.
 */
export type FailureReason = "auth" | "unavailable";

export interface StoreSummary {
  /** The brand (`BRAND`): the API's store name is the market stall. */
  name: string;
  /** ERP banners; the hero shows its copy alone when there are none. */
  banners: StoreBanner[];
  configured: boolean;
  reason?: FailureReason;
  error?: string;
}

export interface CatalogView {
  products: Product[];
  categories: Category[];
  categoryImages: Record<number, string>;
  showImages: boolean;
  showStock: boolean;
  configured: boolean;
  reason?: FailureReason;
  error?: string;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : "Do'kon ma'lumotlari yuklanmadi";
}

function classify(error: unknown): FailureReason {
  if (error instanceof StorefrontError && [401, 403, 500].includes(error.status)) return "auth";
  return "unavailable";
}

function summarize(info: StoreInfo): StoreSummary {
  return {
    name: BRAND,
    banners: normalizeBanners(info.banners ?? [], media),
    configured: true,
  };
}

/**
 * Image URLs arrive absolute (the CDN) or relative to the API host; resolving
 * them here means components only ever see absolute URLs. Categories are
 * normalized here too, so every page reads the same two-level tree.
 */
function view(raw: CatalogResponse): CatalogView {
  const products = normalizeCategories(
    (raw.results ?? []).map((product) => ({
      ...product,
      name: product.name?.trim() || "Nomsiz mahsulot",
      image: media(product.image),
      images: product.images?.map(media).filter(Boolean),
      variants: (product.variants ?? []).map((v) => ({ ...v, image: media(v.image) || null })),
      units: product.units ?? [],
      attributes: product.attributes ?? {},
    })),
  );

  const categories = buildCategories(products);
  const images = categoryImageMap((raw.category_images ?? []).map((c) => ({ ...c, image: media(c.image) })));
  for (const category of categories) {
    images[category.id] ||= productsInCategory(products, category.id).find((p) => p.image)?.image || "";
  }
  return {
    products,
    categories,
    categoryImages: images,
    showImages: raw.show_images !== false,
    showStock: raw.show_stock !== false,
    configured: true,
  };
}

/** A failed call must not blank the site; the page says why instead. */
export const getStore = cache(async (): Promise<StoreSummary> => {
  try {
    return summarize(await getStoreInfo());
  } catch (error) {
    return {
      name: BRAND,
      banners: [],
      configured: false,
      reason: classify(error),
      error: describe(error),
    };
  }
});

/**
 * The catalog and its categories, with the signed-in customer's own prices
 * when there is one. The API has no per-product endpoint, so every page that
 * needs a product reads this list.
 */
export const getCatalogView = cache(async (customerCode?: string): Promise<CatalogView> => {
  try {
    return view(await getCatalog(customerCode));
  } catch (error) {
    return {
      products: [],
      categories: [],
      categoryImages: {},
      showImages: true,
      showStock: true,
      configured: false,
      reason: classify(error),
      error: describe(error),
    };
  }
});

export const findProduct = cache(async (id: number, customerCode?: string) => {
  const { products } = await getCatalogView(customerCode);
  return products.find((product) => product.id === id) ?? null;
});

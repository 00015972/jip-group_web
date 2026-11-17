import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";
import { getCatalogView } from "@/lib/storefront/store";

/** Built per request from the live catalog, like the pages themselves. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getCatalogView();
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/catalog` },
    ...categories.filter((c) => c.id > 0).map((c) => ({ url: `${SITE_URL}/catalog?category=${c.id}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.id}` })),
    { url: `${SITE_URL}/privacy` },
  ];
}

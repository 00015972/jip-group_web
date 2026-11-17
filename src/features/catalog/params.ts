import { SORT_OPTIONS, type CatalogFilters, type SortKey } from "@/lib/storefront/catalog";

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads the catalog filters from the URL; anything malformed is ignored. */
export function parseFilters(params: SearchParams): CatalogFilters {
  const category = Number(first(params.category));
  const sort = first(params.sort) as SortKey;
  return {
    categoryId: first(params.category) && Number.isFinite(category) ? category : null,
    query: first(params.q).trim(),
    inStockOnly: first(params.stock) === "1",
    sort: SORT_OPTIONS.some((o) => o.key === sort) ? sort : "default",
  };
}

/** The catalog URL for `filters` with `patch` applied. */
export function catalogHref(filters: CatalogFilters, patch: Partial<CatalogFilters> = {}): string {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();
  if (next.categoryId != null) params.set("category", String(next.categoryId));
  if (next.query) params.set("q", next.query);
  if (next.inStockOnly) params.set("stock", "1");
  if (next.sort !== "default") params.set("sort", next.sort);
  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}

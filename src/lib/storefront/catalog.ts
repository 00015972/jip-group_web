import { isOutOfStock, productOptions } from "../product/options.ts";

import type { Category, CategoryImage, Product } from "./types";

/**
 * Synthetic top-level category for products the ERP never assigned one to.
 * Real category ids come from the ERP as positive integers, so this can't
 * collide with one.
 */
export const UNCATEGORIZED_ID = -1;
export const UNCATEGORIZED_NAME = "Boshqa mahsulotlar";

/** After `normalizeCategories`, a product has a category id exactly when it has a named category to sit in. */
export function isUncategorized(p: Product): boolean {
  return !p.category_id;
}

interface NamedCategory {
  id: number;
  name: string;
}

/**
 * Rewrites each product's category fields into the two levels the storefront
 * shows: a top category, and at most one subcategory under it.
 *
 * The API sends no category tree, only each product's category and that
 * category's parent, and nothing guarantees those rows are complete. Taken
 * as they come, a product drops out of the home grid without a trace when its
 * category has no name (deleted or renamed in the ERP), when its parent has
 * no name so the category hangs under nothing, or when the tree is three
 * levels deep so its parent is itself a subcategory. So:
 *  - a name missing on one row is taken from any other row that has it;
 *  - a nameless category hands its products to its nearest named ancestor,
 *    or to "Boshqa mahsulotlar" when it has none;
 *  - a category whose parent is unknown becomes a top category;
 *  - anything deeper sits directly under its top category, labelled with the
 *    levels in between ("Erkaklar › Ko'ylaklar") so same-named leaves differ.
 *
 * `view()` runs this once, so every later derivation sees the same rows.
 */
export function normalizeCategories(products: Product[]): Product[] {
  const names = new Map<number, string>();
  const parents = new Map<number, number>();
  const learnName = (id: number | null, name: string | null) => {
    const trimmed = name?.trim();
    if (id && trimmed && !names.has(id)) names.set(id, trimmed);
  };
  for (const p of products) {
    learnName(p.category_id, p.category_name);
    learnName(p.category_parent_id, p.category_parent_name);
    const { category_id: id, category_parent_id: parentId } = p;
    if (id && parentId && parentId !== id && !parents.has(id)) parents.set(id, parentId);
  }

  /** The named categories from `id` up to its root, nearest first. */
  const namedChain = (id: number): NamedCategory[] => {
    const chain: NamedCategory[] = [];
    const seen = new Set<number>();
    for (let current: number | undefined = id; current !== undefined; ) {
      seen.add(current);
      const name = names.get(current);
      if (name) chain.push({ id: current, name });
      let up = parents.get(current);
      // A loop in the ERP data: cut it here, so every later walk agrees on
      // where the tree ends.
      if (up !== undefined && seen.has(up)) {
        parents.delete(current);
        up = undefined;
      }
      current = up;
    }
    return chain;
  };

  return products.map((p) => {
    const anchor = p.category_id || p.category_parent_id;
    const chain = anchor ? namedChain(anchor) : [];
    const top = chain.at(-1);
    if (!top) {
      return { ...p, category_id: null, category_name: null, category_parent_id: null, category_parent_name: null };
    }
    if (chain.length === 1) {
      return { ...p, category_id: top.id, category_name: top.name, category_parent_id: null, category_parent_name: null };
    }
    return {
      ...p,
      category_id: chain[0].id,
      category_name: chain.slice(0, -1).reverse().map((c) => c.name).join(" › "),
      category_parent_id: top.id,
      category_parent_name: top.name,
    };
  });
}

/**
 * The API returns no category tree — each product just carries its category
 * and that category's parent. The flat list is rebuilt here from the product
 * rows (after `normalizeCategories`), in the order the ERP first mentions
 * each category. Products with no category at all are collected under a
 * synthetic catch-all, appended last, so they still have somewhere to appear
 * instead of vanishing from the grid.
 */
export function buildCategories(products: Product[]): Category[] {
  const map = new Map<number, Category>();
  let hasUncategorized = false;
  for (const p of products) {
    if (p.category_id && p.category_name) {
      map.set(p.category_id, {
        id: p.category_id,
        name: p.category_name,
        parentId: p.category_parent_id || null,
      });
    } else if (isUncategorized(p)) {
      hasUncategorized = true;
    }
    if (p.category_parent_id && p.category_parent_name && !map.has(p.category_parent_id)) {
      map.set(p.category_parent_id, {
        id: p.category_parent_id,
        name: p.category_parent_name,
        parentId: null,
      });
    }
  }
  if (hasUncategorized) {
    map.set(UNCATEGORIZED_ID, { id: UNCATEGORIZED_ID, name: UNCATEGORIZED_NAME, parentId: null });
  }
  return [...map.values()];
}

export function categoryImageMap(images: CategoryImage[] | undefined): Record<number, string> {
  return Object.fromEntries((images ?? []).map((c) => [c.id, c.image]));
}


/** Top-level categories, in the order the ERP first mentions them. */
export function topCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.parentId == null);
}

export function productsInCategory(products: Product[], categoryId: number): Product[] {
  if (categoryId === UNCATEGORIZED_ID) return products.filter(isUncategorized);
  return products.filter((p) => p.category_id === categoryId || p.category_parent_id === categoryId);
}

/** Rough price used to order "similar" products by closeness. */
function approxPrice(p: Product): number {
  const options = productOptions(p);
  const available = options.filter((o) => o.inStock);
  const list = available.length ? available : options;
  return list.length ? Math.min(...list.map((o) => o.price)) : Infinity;
}

/**
 * Other products from the same category, then the rest, nearest in price
 * first. Derived from the loaded catalog, with no API call.
 */
export function similarProducts(p: Product | null, all: Product[], limit = 8): Product[] {
  if (!p) return [];
  const sameCategory: Product[] = [];
  const other: Product[] = [];
  for (const x of all) {
    if (x.id === p.id) continue;
    (p.category_id && x.category_id === p.category_id ? sameCategory : other).push(x);
  }
  const base = approxPrice(p);
  const byCloseness = (list: Product[]) =>
    [...list].sort(
      (a, b) =>
        Number(isOutOfStock(a)) - Number(isOutOfStock(b)) ||
        Math.abs(approxPrice(a) - base) - Math.abs(approxPrice(b) - base),
    );
  return [...byCloseness(sameCategory), ...byCloseness(other)].slice(0, limit);
}

/** Whether the shop has sorted products into ERP categories worth filtering by. */
export function hasRealCategories(categories: Category[]): boolean {
  return categories.some((c) => c.id !== UNCATEGORIZED_ID);
}

/** Search text: name, article, category, description, variant names and articles. */
function haystack(p: Product): string {
  return [
    p.name,
    p.sku,
    p.category_name,
    p.category_parent_name,
    p.description,
    ...(p.variants ?? []).flatMap((v) => [v.name, v.sku]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesSearch(p: Product, query: string): boolean {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = haystack(p);
  return words.every((w) => hay.includes(w));
}

/** Character pairs, used to score how close two strings look. */
function bigrams(value: string): Set<string> {
  const normalized = value.toLowerCase().replace(/[^a-z0-9а-яёўқғҳ]+/gi, " ").trim();
  const pairs = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i++) pairs.add(normalized.slice(i, i + 2));
  return pairs;
}

/**
 * When a search has no exact match: products sharing any word with the
 * query, most shared words first; failing that, the closest spellings, so a
 * typo ("angorko") still finds something.
 */
export function searchSuggestions(query: string, all: Product[], limit = 8): Product[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const scored: [Product, number][] = [];
  for (const p of all) {
    const hay = haystack(p);
    const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > 0) scored.push([p, score]);
  }
  if (scored.length) {
    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, limit).map((s) => s[0]);
  }

  const queryPairs = bigrams(query);
  if (!queryPairs.size) return [];
  return all
    .map((p) => {
      const productPairs = bigrams(haystack(p));
      let overlap = 0;
      queryPairs.forEach((pair) => {
        if (productPairs.has(pair)) overlap++;
      });
      return { p, score: overlap / queryPairs.size };
    })
    .filter(({ score }) => score >= 0.22)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p);
}

export type SortKey = "default" | "price-asc" | "price-desc" | "name";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "default", label: "Tavsiya etilgan" },
  { key: "price-asc", label: "Arzonroq" },
  { key: "price-desc", label: "Qimmatroq" },
  { key: "name", label: "Nomi bo'yicha" },
];

export interface CatalogFilters {
  categoryId: number | null;
  query: string;
  inStockOnly: boolean;
  sort: SortKey;
}

/** The catalog page's list. Sold-out products sink to the end unless hidden. */
export function filterProducts(products: Product[], f: CatalogFilters): Product[] {
  let list = products;
  if (f.categoryId != null) list = productsInCategory(list, f.categoryId);
  if (f.query.trim()) list = list.filter((p) => matchesSearch(p, f.query));
  if (f.inStockOnly) list = list.filter((p) => !isOutOfStock(p));

  const sorted = [...list];
  if (f.sort === "price-asc") sorted.sort((a, b) => approxPrice(a) - approxPrice(b));
  if (f.sort === "price-desc") sorted.sort((a, b) => approxPrice(b) - approxPrice(a));
  if (f.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "uz", { numeric: true }));
  return sorted.sort((a, b) => Number(isOutOfStock(a)) - Number(isOutOfStock(b)));
}

/** Sold-out products never lead a list, whatever order they arrived in. */
export function inStockFirst(products: Product[]): Product[] {
  return [...products].sort((a, b) => Number(isOutOfStock(a)) - Number(isOutOfStock(b)));
}

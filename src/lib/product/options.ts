import type { Product, ProductUnit } from "../storefront/types";

import { allowsDecimal, minQty, roundQty, unitLabel } from "./units.ts";

/**
 * What a customer can pick on a product: one size/grade (variant), or for a
 * product without variants one of its units (dona, poddon, tonna). Both are
 * flattened into one shape so the picker, the card and the cart never branch.
 */
export interface BuyOption {
  /** Stable within a product: `v<variant id>`, `u<unit id>` or `base`. */
  key: string;
  variantId: number | null;
  /** Set only for a non-base unit; the base unit is the order default. */
  unitId: number | null;
  /** Variant name, or the unit name when there are several units; else "". */
  label: string;
  /** The unit as the ERP names it ("Metr kvadrat"). */
  unitName: string;
  /** Short unit label: "dona", "m²", "kg". */
  unit: string;
  /** Whether fractions (2.5 m²) can be ordered. */
  decimal: boolean;
  /** Base stock units one of these consumes (1 poddon = 300 dona). */
  multiplier: number;
  /**
   * Which stock this option draws on: every unit of a product shares the
   * product's stock, each variant has its own.
   */
  pool: string;
  /** The pool's stock in base units; `Infinity` when not tracked. */
  poolStock: number;
  sku: string;
  image: string;
  /** In so'm. */
  price: number;
  /** In `currency`, like `curPrice`; null when not discounted. */
  originalPrice: number | null;
  /** Empty means so'm. */
  currency: string;
  curPrice: number;
  /** How many of this unit are in stock; `Infinity` when not tracked. */
  stock: number;
  inStock: boolean;
}

export function hasVariants(p: Product): boolean {
  return Boolean(p.has_variants && p.variants?.length);
}

/** The product's own unit: the one with no multiplier, else the first. */
export function baseUnit(p: Product): ProductUnit | undefined {
  return p.units?.find((u) => u.is_base) ?? p.units?.find((u) => (u.multiplier || 1) === 1) ?? p.units?.[0];
}

function unitStock(stock: number, multiplier: number, decimal: boolean): number {
  if (!Number.isFinite(stock)) return Infinity;
  return Math.max(0, roundQty(stock / (multiplier || 1), decimal));
}

export function productOptions(p: Product): BuyOption[] {
  const tracked = p.stock_type === "tracked";
  const base = baseUnit(p);
  const baseName = base?.unit_name || "dona";

  if (hasVariants(p)) {
    const decimal = allowsDecimal(baseName);
    return p.variants.map((v) => {
      const poolStock = tracked ? Math.max(0, v.stock ?? 0) : Infinity;
      const stock = unitStock(poolStock, 1, decimal);
      return {
        key: `v${v.id}`,
        variantId: v.id,
        unitId: null,
        label: v.name.trim(),
        unitName: baseName,
        unit: unitLabel(baseName),
        decimal,
        multiplier: 1,
        pool: `v${v.id}`,
        poolStock,
        sku: v.sku || p.sku,
        image: v.image || p.image,
        price: v.price,
        originalPrice: v.currency ? v.cur_original_price : (v.cur_original_price ?? v.original_price),
        currency: v.currency || "",
        curPrice: v.cur_price ?? v.price,
        stock,
        inStock: (!tracked || v.in_stock) && stock >= minQty(decimal),
      };
    });
  }

  const units = p.units?.length ? p.units : [];
  if (!units.length) return [];
  const several = units.length > 1;
  return units.map((u) => {
    const decimal = allowsDecimal(u.unit_name);
    const multiplier = u.multiplier || 1;
    const poolStock = tracked ? Math.max(0, p.stock ?? 0) : Infinity;
    const stock = unitStock(poolStock, multiplier, decimal);
    return {
      key: u.unit_id != null ? `u${u.unit_id}` : "base",
      variantId: null,
      unitId: u.unit_id ?? null,
      label: several ? u.unit_name.trim() : "",
      unitName: u.unit_name || "dona",
      unit: unitLabel(u.unit_name),
      decimal,
      multiplier,
      pool: `p${p.id}`,
      poolStock,
      sku: p.sku,
      image: p.image,
      price: u.price,
      originalPrice: u.currency ? (u.cur_original_price ?? null) : (u.cur_original_price ?? u.original_price ?? null),
      currency: u.currency || "",
      curPrice: u.cur_price ?? u.price,
      stock,
      inStock: (!tracked || p.in_stock) && stock >= minQty(decimal),
    };
  });
}

/** The requested option when it exists, else the first one in stock. */
export function defaultOption(options: BuyOption[], key?: string | null): BuyOption | undefined {
  return options.find((o) => key != null && o.key === key) ?? options.find((o) => o.inStock) ?? options[0];
}

export function isOutOfStock(p: Product): boolean {
  return !productOptions(p).some((o) => o.inStock);
}

/**
 * The cheapest option per currency, so unlike currencies are never compared,
 * and whether prices differ ("56 000 so'm dan").
 */
export function optionPriceGroups(options: BuyOption[]): { option: BuyOption; varies: boolean }[] {
  const available = options.filter((o) => o.inStock);
  const groups = new Map<string, BuyOption[]>();
  for (const option of available.length ? available : options) {
    const key = option.currency || "UZS";
    groups.set(key, [...(groups.get(key) ?? []), option]);
  }
  return [...groups.values()].map((group) => ({
    option: group.reduce((min, next) => (next.curPrice < min.curPrice ? next : min)),
    // Unit options differ in price because they differ in size; only
    // variants of one unit are a genuine "from" price.
    varies: new Set(group.map((o) => o.curPrice)).size > 1,
  }));
}

/** A handful left: worth flagging on cards and the buy box. */
export function isLowStock(option: BuyOption): boolean {
  if (!option.inStock || !Number.isFinite(option.stock)) return false;
  return option.stock <= (option.decimal ? 10 : 20);
}

/** The product's photos, main first, then any variant photos not in it. */
export function productGallery(p: Product): string[] {
  const photos = [...(p.images?.length ? p.images : [p.image])];
  for (const v of p.variants ?? []) if (v.image) photos.push(v.image);
  return [...new Set(photos.filter(Boolean))];
}

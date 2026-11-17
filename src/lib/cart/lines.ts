import { productOptions, type BuyOption } from "../product/options.ts";
import { minQty, roundQty } from "../product/units.ts";
import { fmtNumber } from "../storefront/currency.ts";
import type { OrderItemPayload, Product } from "../storefront/types";

import type { CartItem } from "./types";

/**
 * Pure cart reducers: each takes the current lines and returns the next ones,
 * or the same array when nothing changes. `useCart` persists the result.
 */

/** Stored stand-in for "no limit": JSON has no Infinity. */
export const UNLIMITED = 999_999;

const storable = (max: number) => (Number.isFinite(max) ? max : UNLIMITED);

export function lineKey(productId: number, optionKey: string): string {
  return `${productId}_${optionKey}`;
}

/** Price × quantity, in the line's own currency. */
export function lineTotal(it: CartItem): number {
  return it.cur_price * it.qty;
}

/** Lines in the shape `groupTotal` sums. */
export function totalsInput(cart: CartItem[]) {
  return cart.map((it) => ({ currency: it.currency, price: it.price, cur_price: it.cur_price, qty: it.qty }));
}

/** Base stock units the other lines in `pool` already hold. */
function usedInPool(cart: CartItem[], pool: string, exceptKey: string): number {
  return cart.reduce((sum, x) => (x.pool === pool && x.key !== exceptKey ? sum + x.qty * x.multiplier : sum), 0);
}

/**
 * The most of `option` a line can hold: its stock, less what other lines of
 * the same stock (another unit of this product) already take.
 */
export function capFor(cart: CartItem[], productId: number, option: BuyOption): number {
  if (!option.inStock) return 0;
  if (!Number.isFinite(option.poolStock)) return Infinity;
  const free = option.poolStock - usedInPool(cart, option.pool, lineKey(productId, option.key));
  return Math.max(0, roundQty(free / option.multiplier, option.decimal));
}

function lineFor(p: Product, option: BuyOption, qty: number, max: number): CartItem {
  return {
    key: lineKey(p.id, option.key),
    product_id: p.id,
    variant_id: option.variantId,
    unit_id: option.unitId,
    option_key: option.key,
    pool: option.pool,
    multiplier: option.multiplier,
    name: p.name,
    option_label: option.label,
    sku: option.sku,
    image: option.image,
    qty: Math.min(roundQty(qty, option.decimal), max),
    max_qty: storable(max),
    unit: option.unit,
    decimal: option.decimal,
    price: option.price,
    currency: option.currency,
    cur_price: option.curPrice,
  };
}

/** Adds `qty` of an option, never beyond what its stock has left. */
export function addLine(cart: CartItem[], p: Product, option: BuyOption, qty: number): CartItem[] {
  const max = capFor(cart, p.id, option);
  if (max < minQty(option.decimal) || !(qty > 0)) return cart;

  const key = lineKey(p.id, option.key);
  const existing = cart.find((x) => x.key === key);
  if (existing) {
    const next = Math.min(roundQty(existing.qty + qty, option.decimal), max);
    if (next === existing.qty) return cart;
    return cart.map((x) => (x.key === key ? { ...x, qty: next, max_qty: storable(max) } : x));
  }
  return [...cart, lineFor(p, option, qty, max)];
}

/** Sets a line's quantity, capped at its stock; zero or less removes it. */
export function setLineQty(cart: CartItem[], key: string, qty: number): CartItem[] {
  const item = cart.find((x) => x.key === key);
  if (!item) return cart;
  const capped = Math.min(roundQty(qty, item.decimal), item.max_qty);
  if (!(capped >= minQty(item.decimal))) return cart.filter((x) => x.key !== key);
  if (capped === item.qty) return cart;
  return cart.map((x) => (x.key === key ? { ...x, qty: capped } : x));
}

export function removeLine(cart: CartItem[], key: string): CartItem[] {
  return cart.some((x) => x.key === key) ? cart.filter((x) => x.key !== key) : cart;
}

/**
 * Re-checks saved lines against the current catalog: prices, names and
 * photos are refreshed; quantities are capped to stock, with lines that
 * share a stock capped together in cart order; lines whose product or option
 * is gone or sold out are dropped.
 */
export function revalidateCart(cart: CartItem[], products: Product[]): CartItem[] {
  if (!products.length) return cart;
  const byId = new Map(products.map((p) => [p.id, p]));

  const next: CartItem[] = [];
  for (const it of cart) {
    const p = byId.get(it.product_id);
    const option = p && productOptions(p).find((o) => o.key === it.option_key);
    if (!p || !option) continue;
    const max = capFor(next, p.id, option);
    if (max < minQty(option.decimal)) continue;
    next.push(lineFor(p, option, it.qty, max));
  }

  return JSON.stringify(next) === JSON.stringify(cart) ? cart : next;
}

/** Accepts only well-formed lines from a saved cart. */
export function sanitizeStoredCart(saved: unknown): CartItem[] {
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(
      (it) =>
        it &&
        typeof it.option_key === "string" &&
        typeof it.product_id === "number" &&
        typeof it.pool === "string" &&
        Number(it.qty) > 0 &&
        Number(it.multiplier) > 0,
    )
    .map((it) => ({
      ...it,
      key: lineKey(it.product_id, it.option_key),
      qty: Number(it.qty),
      max_qty: Number(it.max_qty) > 0 ? Number(it.max_qty) : UNLIMITED,
      multiplier: Number(it.multiplier),
      decimal: Boolean(it.decimal),
    }));
}

/** What `POST /storefront/orders/` gets: quantities in each line's own unit. */
export function toOrderItems(cart: CartItem[]): OrderItemPayload[] {
  return cart.map((it) => ({
    product_id: it.product_id,
    ...(it.variant_id ? { variant_id: it.variant_id } : {}),
    ...(it.unit_id ? { unit_id: it.unit_id } : {}),
    qty: it.qty,
  }));
}

/**
 * Order lines that ask for more than the catalog has, as messages for the
 * customer. The ERP checks too, but for a product without variants it has
 * answered over-stock with a bare 500, so they are caught before it is asked.
 * Lines drawing on one stock (two units of a product) are checked together.
 */
export function stockProblems(items: OrderItemPayload[], products: Product[]): string[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const pools = new Map<string, { p: Product; option: BuyOption; used: number }>();
  const problems: string[] = [];

  for (const item of items) {
    const p = byId.get(item.product_id);
    if (!p) continue;
    const options = productOptions(p);
    const option = item.variant_id
      ? options.find((o) => o.variantId === item.variant_id)
      : (options.find((o) => o.unitId != null && o.unitId === item.unit_id) ?? options.find((o) => o.unitId == null) ?? options[0]);
    if (!option) {
      problems.push(`${p.name}: bu turi endi sotilmaydi`);
      continue;
    }
    const entry = pools.get(option.pool) ?? { p, option, used: 0 };
    entry.used += item.qty * option.multiplier;
    pools.set(option.pool, entry);
  }

  for (const { p, option, used } of pools.values()) {
    // A thousandth of slack for decimal rounding.
    if (used <= option.poolStock + 0.001) continue;
    const name = option.variantId ? `${p.name} · ${option.label}` : p.name;
    const base = option.multiplier === 1 ? option : (productOptions(p).find((o) => o.multiplier === 1) ?? option);
    problems.push(
      option.poolStock > 0
        ? `${name}: omborda ${fmtNumber(option.poolStock)} ${base.unit} qoldi, siz ${fmtNumber(used)} ${base.unit} so'radingiz`
        : `${name}: tugagan`,
    );
  }
  return problems;
}

/**
 * Money formatting. Every price is shown in its own currency: a USD price
 * shows `$50`, anything else so'm. An empty currency means the store's base
 * currency, which for dukonline tenants is so'm.
 */

/** Space thousands separators, the convention across UZ retail. */
function withThousands(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** `som(50000) -> "50 000 so'm"`. */
export function som(amount: number | null | undefined): string {
  return withThousands(Math.round(Number(amount) || 0).toString()) + " so'm";
}

/** `money(50, "USD") -> "$50"`, `money(50000, "") -> "50 000 so'm"`. */
export function money(amount: number | null | undefined, currency?: string | null): string {
  if (!currency || currency === "UZS") return som(amount);

  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const [whole, fraction] = Number.isInteger(value)
    ? [value.toString(), ""]
    : value.toFixed(2).split(".");

  const prefix = currency === "USD" ? "$" : `${currency} `;
  return prefix + withThousands(whole) + (fraction ? `.${fraction}` : "");
}

/**
 * The API offers no currency conversion, so totals are summed per currency
 * and shown side by side: `"$52  +  300 000 so'm"`.
 */
export function groupTotal(
  items: { currency?: string; price: number; cur_price?: number | null; qty: number }[],
): string {
  const totals = new Map<string, number>();
  for (const item of items ?? []) {
    const code = item.currency || "";
    totals.set(code, (totals.get(code) ?? 0) + (item.cur_price ?? item.price) * item.qty);
  }
  if (totals.size === 0) return som(0);
  return [...totals.entries()].map(([code, sum]) => money(sum, code)).join("  +  ");
}

/** A whole number shows as "2", a fraction as "2.5" (at most 2 decimals). */
export function fmtNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return withThousands(String(Math.trunc(rounded))) +
    (Number.isInteger(rounded) ? "" : "." + rounded.toFixed(2).split(".")[1].replace(/0+$/, ""));
}

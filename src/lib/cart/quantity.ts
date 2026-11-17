import { minQty, roundQty } from "../product/units.ts";

/**
 * Turns what was typed into a quantity field into the quantity to apply, or
 * `null` to discard the edit. Empty and non-numeric input is discarded, so a
 * customer can clear "1" and type "10" without the line vanishing in between.
 * Measured goods keep one decimal ("2,5" and "2.5" both work); counted goods
 * drop the fraction. Nothing goes below the minimum or above `max`.
 */
export function commitQty(draft: string, { max = Infinity, decimal = false }: { max?: number; decimal?: boolean } = {}): number | null {
  const raw = draft.trim().replace(",", ".").replace(/\s+/g, "");
  if (raw === "") return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(Math.max(minQty(decimal), roundQty(parsed, decimal)), max);
}

/** The next value of a +/− button: whole steps, never below the minimum or above `max`. */
export function stepQty(qty: number, direction: 1 | -1, { max = Infinity, decimal = false }: { max?: number; decimal?: boolean } = {}): number {
  const next = roundQty(qty + direction, decimal);
  return Math.min(Math.max(minQty(decimal), next), max);
}

/**
 * One cart line: an amount of one option (size/grade or unit) of a product.
 *
 *   key: `${product_id}_${option key}`   e.g. `18942_base`, `18943_v501`
 */
export interface CartItem {
  key: string;
  product_id: number;
  variant_id: number | null;
  /** Only for a non-base unit (poddon, tonna). */
  unit_id: number | null;
  /** Links back to the option on the product page (`base`, `u12`, `v501`). */
  option_key: string;
  /** Which stock the line draws on; lines in one pool share it. */
  pool: string;
  /** Base stock units one of this unit consumes. */
  multiplier: number;

  name: string;
  /** Size/grade or unit name; empty when the product has one option. */
  option_label: string;
  sku: string;
  image: string;

  /** In the line's unit. */
  qty: number;
  /** The cap on `qty` from stock; `UNLIMITED` when stock is not tracked. */
  max_qty: number;
  /** "dona", "m²", "kg". */
  unit: string;
  /** Whether fractions can be ordered. */
  decimal: boolean;

  /** In so'm. */
  price: number;
  /** The option's own currency; empty means so'm. */
  currency: string;
  /** The price in `currency`. */
  cur_price: number;
}

/**
 * Types for the dukonline.uz Storefront API, taken from live responses of
 * `https://api.dukonline.uz/api/storefront/*` for the JIP Group tenant.
 *
 * The API has six endpoints and no per-product, category or pagination
 * endpoint, so the whole catalog arrives in one call and everything else is
 * derived from it.
 */

/** `tracked` products decrement stock; others are always sellable. */
export type StockType = "tracked" | "untracked" | (string & {});

/** A banner as the API sends it: a bare URL or an object. */
export type RawStoreBanner =
  | string
  | {
      id?: number;
      image_url?: string;
      image?: string;
      url?: string;
      photo?: string;
      file?: string;
      title?: string;
      align?: string;
      [key: string]: unknown;
    };

export interface StoreBanner {
  image: string;
  title: string;
  align: "left" | "right";
}

export interface StoreInfo {
  /** "Jip group chinni bozor": the ERP account. */
  organization: string;
  /** "1-qator 16-dukon": the stall the stock comes from. */
  store: string;
  /** A symbol (`"$"`), a code (`"USD"`) or a word (`"so'm"`). */
  currency: string;
  banners: RawStoreBanner[];
}

/**
 * One way a product without variants is sold ("Dona", "Metr kvadrat",
 * "Qop"). `multiplier` is how many base stock units one of these consumes, so
 * a product can be sold per piece and per pallet from the same stock.
 */
export interface ProductUnit {
  /** Null for the product's own base unit, which orders then leave out. */
  unit_id: number | null;
  unit_name: string;
  multiplier: number;
  price: number;
  original_price: number | null;
  /** Empty string means the store's base currency (so'm). */
  currency: string;
  /** The price in the product's own `currency`. */
  cur_price: number;
  cur_original_price: number | null;
  is_base?: boolean;
  uom_id?: number | null;
}

/** One size or grade of a product (Ø10 / Ø12, M400 / M500). */
export interface ProductVariant {
  id: number;
  name: string;
  sku?: string;
  image?: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  cur_price: number;
  cur_original_price: number | null;
  /** In the product's base unit; null when stock is not tracked. */
  stock: number | null;
  in_stock: boolean;
}

/**
 * Free-form attributes set in the ERP. None are sent today; the storefront
 * shows any that appear and reads a weight from them when there is one.
 */
export type ProductAttributes = Record<string, string | number | null | undefined>;

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category_id: number | null;
  category_name: string | null;
  category_parent_id: number | null;
  category_parent_name: string | null;
  /** The main photo. */
  image: string;
  /** The whole gallery, main photo first. */
  images?: string[];
  stock_type: StockType;
  /** In the base unit (the unit with `multiplier: 1`). */
  stock: number;
  in_stock: boolean;
  has_variants: boolean;
  variants: ProductVariant[];
  units: ProductUnit[];
  discount_percent: number;
  /** ERP product class; empty for ordinary goods. */
  product_type: string;
  attributes: ProductAttributes;
  /** Position set in the ERP, lowest first; the storefront lists products in this order. */
  sort_order?: number | null;
}

export interface CategoryImage {
  id: number;
  image: string;
}

export interface CatalogResponse {
  store: string;
  results: Product[];
  show_stock: boolean;
  show_images: boolean;
  category_images: CategoryImage[];
}

export interface Customer {
  customer_code: string;
  code?: string;
  name?: string;
  customer_name?: string;
  phone?: string;
  phone_number?: string;
  debt?: number;
  credit?: number;
  currency_debts?: Record<string, number>;
  currency_advances?: Record<string, number>;
  [key: string]: unknown;
}

export interface CustomerSaleItem {
  name?: string;
  product_name?: string;
  qty?: number;
  quantity?: number;
  unit?: string;
  unit_name?: string;
  price?: number;
}

export interface CustomerSale {
  receipt_number?: string;
  created_at?: string;
  total?: number;
  paid?: number;
  debt?: number;
  debt_currency?: string;
  debt_currency_amount?: number;
  debt_rate?: number;
  payment_breakdown?: { method?: string; amount?: number }[];
  payment_method?: string;
  items?: CustomerSaleItem[];
}

export interface CustomerOrder {
  order_no?: string;
  created_at?: string;
  total?: number;
  status?: string;
}

export interface CustomerPayment {
  amount?: number;
  currency?: string;
  created_at?: string;
  note?: string;
}

export interface CustomerAccountResponse {
  customer: Customer;
  sales: CustomerSale[];
  online_orders: CustomerOrder[];
  payments: CustomerPayment[];
}

export interface OrderItemPayload {
  product_id: number;
  variant_id?: number;
  /** Only for a non-base unit; the base unit is the default. */
  unit_id?: number;
  /** In the chosen unit (or the base unit when `unit_id` is left out). */
  qty: number;
}

export type DeliveryType = "courier" | "pickup";

export interface OrderPayload {
  customer_name: string;
  phone: string;
  delivery_type: DeliveryType;
  payment_method: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  /** The signed-in customer's in-store code. */
  customer_code?: string;
  /** The customer's comment for the shop. */
  note?: string;
  items: OrderItemPayload[];
}

export interface OrderResponse {
  order_no: string;
  status?: string;
  total?: number;
  [key: string]: unknown;
}

/** A category derived from product rows; `parentId` null = top level. */
export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

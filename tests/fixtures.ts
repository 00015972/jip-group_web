import type { Product, ProductUnit } from "../src/lib/storefront/types";

function unit(name: string, price: number, extra: Partial<ProductUnit> = {}): ProductUnit {
  return { unit_id: null, unit_name: name, multiplier: 1, is_base: true, price, original_price: null, currency: "", cur_price: price, cur_original_price: null, ...extra };
}

export function product(over: Partial<Product> & Pick<Product, "id" | "name">): Product {
  return {
    sku: `SKU-${over.id}`,
    description: "",
    category_id: null,
    category_name: null,
    category_parent_id: null,
    category_parent_name: null,
    image: "https://example.com/p.webp",
    stock_type: "infinite",
    stock: 0,
    in_stock: true,
    has_variants: false,
    variants: [],
    units: [unit("Dona", 1000)],
    discount_percent: 0,
    product_type: "",
    attributes: {},
    ...over,
  };
}

const cat = (id: number, name: string) => ({ category_id: id, category_name: name });

/* The live JIP Group catalog (2026-11-17): names, prices and categories as the ERP sends them. */
export const flask = product({ id: 36441, name: "100L Konteyner", ...cat(838, "Katta sig'imli baklar"), units: [unit("Dona", 200000)] });
export const bin = product({ id: 36442, name: "Chiqindi Konteyner 100L", ...cat(840, "Idishlar va konteynerlar"), units: [unit("Dona", 250000)] });
export const tank = product({ id: 36436, name: "Rotatsion Tankalar", ...cat(838, "Katta sig'imli baklar"), units: [unit("Dona", 300000)] });
export const tableSet = product({ id: 36438, name: "Stol-Stul 1-4 qora", ...cat(839, "Stol-Stul"), units: [unit("Dona", 700000)] });
export const tee = product({ id: 36443, name: "Тройник JIP GROUP канализационный ПВХ 90°", ...cat(841, "Santexnika"), units: [unit("Dona", 15000)] });

export const catalog = [flask, bin, tank, tableSet, tee];

/* Shapes the ERP supports but this catalog doesn't use yet: tracked stock and a box unit. */
export const boxed = product({
  id: 9001,
  name: "Chelak 10L",
  stock_type: "tracked",
  stock: 20,
  units: [unit("Dona", 55000), unit("Quti", 210000, { unit_id: 77, multiplier: 4, is_base: false })],
});

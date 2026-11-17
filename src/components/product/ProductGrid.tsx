import type { Product } from "@/lib/storefront/types";

import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { RevealList } from "./RevealList";
import reveal from "./RevealList.module.css";

/** Cards drop into place as they come into view (see `RevealList`). */
export function ProductGrid({ products, eagerCount = 0 }: { products: Product[]; eagerCount?: number }) {
  return (
    <RevealList className={styles.grid}>
      {products.map((product, index) => (
        <li key={product.id} className={reveal.pending}>
          <ProductCard product={product} eager={index < eagerCount} />
        </li>
      ))}
    </RevealList>
  );
}

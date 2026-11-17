import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/lib/storefront/types";

import styles from "./ProductSection.module.css";
import { SectionHeading } from "./SectionHeading";

export function ProductSection({ title, products, eagerCount = 0 }: { title: string; products: Product[]; eagerCount?: number }) {
  return (
    <Container className={styles.section}>
      <SectionHeading title={title} note={`${products.length} ta mahsulot`} />
      <ProductGrid products={products} eagerCount={eagerCount} />
    </Container>
  );
}

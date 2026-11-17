import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import { ProductDetail } from "@/features/product/ProductDetail";
import { getCustomerCode } from "@/lib/customer/session";
import { similarProducts } from "@/lib/storefront/catalog";
import { findProduct, getCatalogView, getStore } from "@/lib/storefront/store";

import styles from "./page.module.css";

type Params = Promise<{ id: string }>;
type Search = Promise<{ o?: string | string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(Number(id), await getCustomerCode());
  if (!product) return { title: "Mahsulot topilmadi" };
  const description = product.description?.trim() || [product.name, product.category_name].filter(Boolean).join(". ");
  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, images: product.image ? [product.image] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ id }, { o }] = await Promise.all([params, searchParams]);
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const customerCode = await getCustomerCode();
  const [product, catalog, store] = await Promise.all([findProduct(productId, customerCode), getCatalogView(customerCode), getStore()]);

  if (!catalog.configured) {
    return (
      <Container>
        <SetupNotice reason={catalog.reason ?? store.reason} error={catalog.error ?? store.error} />
      </Container>
    );
  }
  if (!product) notFound();

  const similar = similarProducts(product, catalog.products, 8);
  const topId = product.category_parent_id ?? product.category_id;
  const optionKey = Array.isArray(o) ? o[0] : o;

  return (
    <Container className={styles.page}>
      <Breadcrumbs
        items={[
          { label: "Bosh sahifa", href: "/" },
          { label: "Katalog", href: "/catalog" },
          ...(topId && product.category_name ? [{ label: product.category_parent_name ?? product.category_name, href: `/catalog?category=${topId}` }] : []),
          ...(product.category_parent_id && product.category_id
            ? [{ label: product.category_name!.split(" › ").at(-1)!, href: `/catalog?category=${product.category_id}` }]
            : []),
          { label: product.name },
        ]}
      />

      <ProductDetail key={product.id} product={product} initialOption={optionKey ?? null} showStock={catalog.showStock} />

      {similar.length > 0 && (
        <section className={styles.similar}>
          <h2 className={styles.similarTitle}>O‘xshash mahsulotlar</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </Container>
  );
}

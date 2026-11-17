import { SetupNotice } from "@/components/layout/SetupNotice";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/features/home/Hero";
import { ProductSection } from "@/features/home/ProductSection";
import { getCustomerCode } from "@/lib/customer/session";
import { inStockFirst } from "@/lib/storefront/catalog";
import { getCatalogView, getStore } from "@/lib/storefront/store";

/** Banners, then every product. The categories live in the header's sheet. */
export default async function HomePage() {
  const [store, catalog] = await Promise.all([getStore(), getCatalogView(await getCustomerCode())]);

  if (!catalog.configured) {
    return (
      <Container>
        <SetupNotice reason={catalog.reason ?? store.reason} error={catalog.error ?? store.error} />
      </Container>
    );
  }

  return (
    <>
      <Hero banners={store.banners} />
      <ProductSection title="Barcha mahsulotlar" products={inStockFirst(catalog.products)} eagerCount={4} />
    </>
  );
}

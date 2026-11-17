import { SetupNotice } from "@/components/layout/SetupNotice";
import { Container } from "@/components/ui/Container";
import { CategoryCards } from "@/features/home/CategoryCards";
import { Hero } from "@/features/home/Hero";
import { ProductSection } from "@/features/home/ProductSection";
import { getCustomerCode } from "@/lib/customer/session";
import { inStockFirst, productsInCategory, topCategories } from "@/lib/storefront/catalog";
import { getCatalogView, getStore } from "@/lib/storefront/store";

export default async function HomePage() {
  const [store, catalog] = await Promise.all([getStore(), getCatalogView(await getCustomerCode())]);

  if (!catalog.configured) {
    return (
      <Container>
        <SetupNotice reason={catalog.reason ?? store.reason} error={catalog.error ?? store.error} />
      </Container>
    );
  }

  const categories = topCategories(catalog.categories).map((c) => ({
    id: c.id,
    name: c.name,
    count: productsInCategory(catalog.products, c.id).length,
    image: catalog.categoryImages[c.id] ?? "",
  }));

  return (
    <>
      <Hero banners={store.banners} />
      {categories.length > 1 && <CategoryCards categories={categories} />}
      <ProductSection title="Barcha mahsulotlar" products={inStockFirst(catalog.products)} eagerCount={5} />
    </>
  );
}

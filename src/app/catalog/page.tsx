import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SetupNotice } from "@/components/layout/SetupNotice";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { catalogHref, parseFilters, type SearchParams } from "@/features/catalog/params";
import { SortSelect } from "@/features/catalog/SortSelect";
import { getCustomerCode } from "@/lib/customer/session";
import { filterProducts, productsInCategory, searchSuggestions, topCategories } from "@/lib/storefront/catalog";
import { getCatalogView, getStore } from "@/lib/storefront/store";

import styles from "./page.module.css";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const { categories } = await getCatalogView(await getCustomerCode());
  const category = categories.find((c) => c.id === filters.categoryId);
  return { title: category?.name ?? (filters.query ? `"${filters.query}"` : "Katalog") };
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseFilters(await searchParams);
  const [store, catalog] = await Promise.all([getStore(), getCatalogView(await getCustomerCode())]);

  if (!catalog.configured) {
    return (
      <Container>
        <SetupNotice reason={catalog.reason ?? store.reason} error={catalog.error ?? store.error} />
      </Container>
    );
  }

  const category = catalog.categories.find((c) => c.id === filters.categoryId) ?? null;
  const parent = catalog.categories.find((c) => c.id === category?.parentId);
  const tops = topCategories(catalog.categories);
  // The chip row highlights the top category, also while a subcategory is open.
  const activeTop = parent?.id ?? category?.id ?? null;
  const results = filterProducts(catalog.products, filters);
  const suggestions = results.length === 0 && filters.query ? searchSuggestions(filters.query, catalog.products) : [];
  const title = filters.query ? `“${filters.query}”` : (category?.name ?? "Barcha mahsulotlar");

  return (
    <Container className={styles.page}>
      <Breadcrumbs
        items={[
          { label: "Bosh sahifa", href: "/" },
          { label: "Katalog", href: category || filters.query ? "/catalog" : undefined },
          ...(parent ? [{ label: parent.name, href: `/catalog?category=${parent.id}` }] : []),
          ...(category ? [{ label: category.name }] : []),
        ]}
      />

      <div className={styles.head}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.count}>{results.length} ta mahsulot</p>
      </div>

      {tops.length > 1 && (
        <nav aria-label="Kategoriyalar" className={styles.chips}>
          <Link href={catalogHref(filters, { categoryId: null })} className={styles.chip} aria-current={activeTop == null ? "page" : undefined}>
            Barchasi
            <span className={styles.chipCount}>{catalog.products.length}</span>
          </Link>
          {tops.map((c) => (
            <Link key={c.id} href={catalogHref(filters, { categoryId: c.id })} className={styles.chip} aria-current={activeTop === c.id ? "page" : undefined}>
              {c.name}
              <span className={styles.chipCount}>{productsInCategory(catalog.products, c.id).length}</span>
            </Link>
          ))}
        </nav>
      )}

      <div className={styles.toolbar}>
        {filters.query ? (
          <Link href={catalogHref(filters, { query: "" })} className={styles.clearQuery}>
            Qidiruvni bekor qilish
          </Link>
        ) : (
          <span />
        )}
        <SortSelect filters={filters} />
      </div>

      {results.length > 0 ? (
        <ProductGrid products={results} eagerCount={4} />
      ) : (
        <>
          <EmptyState
            icon={<SearchX size={32} aria-hidden />}
            title="Hech narsa topilmadi"
            text="Boshqa so‘z bilan qidirib ko‘ring yoki kategoriyani o‘zgartiring."
            action={
              <ButtonLink href="/catalog" variant="secondary">
                Barcha mahsulotlar
              </ButtonLink>
            }
          />
          {suggestions.length > 0 && (
            <section className={styles.suggestions}>
              <h2 className={styles.suggestionsTitle}>Balki shular kerakdir</h2>
              <ProductGrid products={suggestions} />
            </section>
          )}
        </>
      )}
    </Container>
  );
}

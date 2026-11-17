import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ShopOverlays } from "@/components/layout/ShopOverlays";
import { ShopUiProvider } from "@/components/layout/ShopUi";
import { BRAND } from "@/config/store";
import { CartSync } from "@/lib/cart/CartSync";
import { getCustomerCode } from "@/lib/customer/session";
import { CatalogProvider } from "@/lib/storefront/CatalogProvider";
import { SITE_URL } from "@/lib/site";
import { getCatalogView } from "@/lib/storefront/store";

import "./globals.css";
import styles from "./layout.module.css";

/* Cyrillic too: some product names are typed in Russian in the ERP. */
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

/*
 * Rendered per request, so prices and stock are always the ERP's current
 * ones: the Worker has no incremental cache that could refresh prerendered pages.
 */
export const dynamic = "force-dynamic";

const description = `${BRAND}: plastik baklar, chiqindi konteynerlari, stol-stullar va santexnika. Onlayn buyurtma bering.`;

export const metadata: Metadata = {
  // The public address, so shared links get absolute preview images.
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND}: plastik mahsulotlar`, template: `%s · ${BRAND}` },
  description,
  openGraph: { title: BRAND, description, type: "website" },
  twitter: { card: "summary", title: BRAND, description },
};

export const viewport: Viewport = {
  themeColor: "#1d5bd6",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Needed on every page (search, cart checks); `cache()` makes the pages'
  // own calls for the same data free.
  const catalog = await getCatalogView(await getCustomerCode());

  return (
    <html lang="uz" className={manrope.variable}>
      <body>
        <CatalogProvider
          value={{
            storeName: BRAND,
            products: catalog.products,
            categories: catalog.categories,
            categoryImages: catalog.categoryImages,
            showImages: catalog.showImages,
            showStock: catalog.showStock,
          }}
        >
          <ShopUiProvider>
            <CartSync />
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
            <ShopOverlays />
          </ShopUiProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}

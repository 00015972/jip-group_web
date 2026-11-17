"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Category, Product } from "./types";

interface CatalogContextValue {
  storeName: string;
  products: Product[];
  categories: Category[];
  categoryImages: Record<number, string>;
  showImages: boolean;
  showStock: boolean;
}

const CatalogContext = createContext<CatalogContextValue>({
  storeName: "",
  products: [],
  categories: [],
  categoryImages: {},
  showImages: true,
  showStock: true,
});

/**
 * The catalog, fetched once by the root layout, for client components that
 * need all of it: search suggestions and
 * keeping the saved cart in step with stock.
 */
export function CatalogProvider({ value, children }: { value: CatalogContextValue; children: ReactNode }) {
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}

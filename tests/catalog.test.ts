import assert from "node:assert/strict";
import { test } from "node:test";

import { buildCategories, filterProducts, matchesSearch, normalizeCategories, productsInCategory, searchSuggestions, similarProducts, topCategories } from "../src/lib/storefront/catalog.ts";
import { money, som } from "../src/lib/storefront/currency.ts";

import { bin, catalog, flask, tableSet, tank, tee } from "./fixtures.ts";

const products = normalizeCategories(catalog);

test("categories come in the order the feed first names them", () => {
  assert.deepEqual(topCategories(buildCategories(products)).map((c) => c.name), ["Katta sig'imli baklar", "Idishlar va konteynerlar", "Stol-Stul", "Santexnika"]);
  assert.deepEqual(productsInCategory(products, 838).map((p) => p.id), [flask.id, tank.id]);
});

test("search reads names in Latin and Cyrillic, and categories", () => {
  assert.ok(matchesSearch(tee, "тройник"));
  assert.ok(matchesSearch(tableSet, "stol qora"));
  assert.ok(matchesSearch(bin, "konteynerlar"));
  assert.ok(!matchesSearch(flask, "stol"));
  assert.deepEqual(searchSuggestions("stul", products).map((p) => p.id), [tableSet.id]);
});

test("the catalog filters by category and sorts by price", () => {
  const base = { categoryId: null, query: "", inStockOnly: false, sort: "price-asc" as const };
  assert.deepEqual(filterProducts(products, base).map((p) => p.id), [tee.id, flask.id, bin.id, tank.id, tableSet.id]);
  assert.deepEqual(filterProducts(products, { ...base, categoryId: 838, sort: "default" }).map((p) => p.id), [flask.id, tank.id]);
});

test("similar products start with the same category", () => {
  assert.equal(similarProducts(products[0], products)[0].id, tank.id);
});

test("prices are so'm with thousands separators", () => {
  assert.equal(som(700000), "700 000 so'm");
  assert.equal(money(15000, ""), "15 000 so'm");
});

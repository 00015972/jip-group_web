import assert from "node:assert/strict";
import { test } from "node:test";

import { addLine, revalidateCart, sanitizeStoredCart, setLineQty, stockProblems, toOrderItems, totalsInput } from "../src/lib/cart/lines.ts";
import { commitQty, stepQty } from "../src/lib/cart/quantity.ts";
import { productOptions } from "../src/lib/product/options.ts";
import { groupTotal } from "../src/lib/storefront/currency.ts";

import { bin, boxed, flask, product, tee } from "./fixtures.ts";

test("adding caps at stock and merges into the same line", () => {
  const [option] = productOptions(boxed);
  let cart = addLine([], boxed, option, 15);
  cart = addLine(cart, boxed, option, 15);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 20);
});

test("two units of one product share its stock", () => {
  const [piece, box] = productOptions(boxed);
  let cart = addLine([], boxed, box, 3); // 12 pieces
  cart = addLine(cart, boxed, piece, 10); // only 8 left
  assert.equal(cart.find((l) => l.option_key === "base")?.qty, 8);
  // A fourth box no longer fits.
  assert.equal(addLine(cart, boxed, box, 1), cart);
});

test("pieces stay whole", () => {
  assert.equal(commitQty("7.9"), 7);
  assert.equal(commitQty("abc"), null);
  assert.equal(stepQty(3, 1, { max: 3 }), 3);
  assert.equal(stepQty(2, -1), 1);
});

test("untracked stock never caps the cart", () => {
  const cart = addLine([], flask, productOptions(flask)[0], 500);
  assert.equal(cart[0].qty, 500);
});

test("setting zero removes a line", () => {
  const cart = addLine([], bin, productOptions(bin)[0], 2);
  assert.deepEqual(setLineQty(cart, cart[0].key, 0), []);
});

test("so'm lines are totalled with thousands separators", () => {
  let cart = addLine([], bin, productOptions(bin)[0], 2);
  cart = addLine(cart, tee, productOptions(tee)[0], 3);
  assert.equal(groupTotal(totalsInput(cart)), "545 000 so'm");
});

test("revalidation follows new stock and drops sold-out lines", () => {
  const cart = addLine([], boxed, productOptions(boxed)[0], 15);
  const lessStock = { ...boxed, stock: 6 };
  assert.equal(revalidateCart(cart, [lessStock])[0].qty, 6);
  const soldOut = { ...boxed, stock: 0, in_stock: false };
  assert.deepEqual(revalidateCart(cart, [soldOut]), []);
  assert.equal(revalidateCart(cart, [boxed]), cart);
});

test("a saved cart keeps only well-formed lines", () => {
  const [line] = addLine([], flask, productOptions(flask)[0], 1);
  assert.deepEqual(sanitizeStoredCart([line, { qty: 1 }, null]), [line]);
  assert.deepEqual(sanitizeStoredCart("broken"), []);
});

test("order items carry the unit only for non-base units", () => {
  const [piece, box] = productOptions(boxed);
  const cart = addLine(addLine([], boxed, piece, 2), boxed, box, 1);
  assert.deepEqual(toOrderItems(cart), [
    { product_id: 9001, qty: 2 },
    { product_id: 9001, unit_id: 77, qty: 1 },
  ]);
});

test("the server pre-check sums every unit of a product", () => {
  assert.deepEqual(stockProblems([{ product_id: 9001, qty: 12 }, { product_id: 9001, unit_id: 77, qty: 2 }], [boxed]), []);
  const problems = stockProblems([{ product_id: 9001, qty: 13 }, { product_id: 9001, unit_id: 77, qty: 2 }], [boxed]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /20 dona qoldi, siz 21 dona/);
  assert.match(stockProblems([{ product_id: 1, qty: 1 }], [product({ id: 1, name: "X", stock_type: "tracked", stock: 0, in_stock: false })])[0], /tugagan/);
});

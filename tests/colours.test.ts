import assert from "node:assert/strict";
import { test } from "node:test";

import { colourOf, colourSwatches } from "../src/lib/product/colours.ts";

test("shop colour names map loosely, shades before their base colour", () => {
  assert.equal(colourOf("Och ko‘k").id, "och-kok");
  assert.equal(colourOf("Ko'k ").id, "kok");
  assert.equal(colourOf("To‘q yashil").id, "toq-yashil");
  assert.equal(colourOf("yashil").id, "yashil");
  assert.equal(colourOf("Apelsin rang ").id, "apelsin");
  assert.equal(colourOf("Qaymoq rang").id, "qaymoq");
  assert.equal(colourOf("Kigarrang").id, "jigarrang");
  assert.equal(colourOf("Yashik").id, "yashil");
  assert.equal(colourOf("jigarrang ").label, "Jigarrang");
});

test("two-tone names split the swatch, unknown names have none", () => {
  assert.equal(colourOf("Qora-oq").id, "qora+oq");
  assert.equal(colourOf("Katta").swatch, null);
  assert.equal(colourOf("").swatch, null);
});

test("swatches only when every one of several options is a known colour", () => {
  assert.equal(colourSwatches([{ label: "Qora" }]), null);
  assert.equal(colourSwatches([{ label: "Qora" }, { label: "10 L" }]), null);
  assert.equal(colourSwatches([{ label: "Qora" }, { label: "Oq" }])?.size, 2);
});

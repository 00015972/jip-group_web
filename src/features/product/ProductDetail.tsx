"use client";

import { useState } from "react";

import { defaultOption, productGallery, productOptions, type BuyOption } from "@/lib/product/options";
import type { Product } from "@/lib/storefront/types";

import { BuyBox } from "./BuyBox";
import { Gallery } from "./Gallery";
import { OptionPicker } from "./OptionPicker";
import styles from "./ProductDetail.module.css";

/**
 * The product page body. The chosen size or unit is kept in the URL
 * (`?o=v501`), so a shared link opens on it.
 */
export function ProductDetail({ product, initialOption, showStock }: { product: Product; initialOption: string | null; showStock: boolean }) {
  const options = productOptions(product);
  const [optionKey, setOptionKey] = useState(() => defaultOption(options, initialOption)?.key ?? "base");
  const option = options.find((o) => o.key === optionKey) ?? options[0];

  const gallery = productGallery(product);
  const [photo, setPhoto] = useState(option?.image || product.image);
  const category = [product.category_parent_name, product.category_name?.split(" › ").at(-1)].filter(Boolean).join(" › ") || null;

  const selectOption = (next: BuyOption) => {
    setOptionKey(next.key);
    if (next.image) setPhoto(next.image);
    window.history.replaceState(null, "", next.key === "base" ? window.location.pathname : `?o=${next.key}`);
  };

  return (
    <div className={styles.detail}>
      <div className={styles.media}>
        <Gallery images={gallery} active={photo} onSelect={setPhoto} alt={`${product.name} ${option?.variantId ? option.label : ""}`.trim()} />
      </div>

      <div className={styles.info}>
        <div className={styles.titleBlock}>
          {category && <p className={styles.category}>{category}</p>}
          <h1 className={styles.title}>{product.name}</h1>
          {option?.sku && <p className={styles.sku}>Artikul: {option.sku}</p>}
        </div>

        {options.length > 1 && <OptionPicker options={options} selectedKey={option.key} onSelect={selectOption} showStock={showStock} />}

        {option ? (
          // Keyed by option, so the quantity starts fresh for each one.
          <BuyBox key={option.key} product={product} option={option} showStock={showStock} />
        ) : (
          <p className={styles.unavailable}>Bu mahsulot hozircha onlayn sotilmaydi.</p>
        )}
      </div>

      {product.description?.trim() && (
        <section className={styles.about}>
          <h2 className={styles.subheading}>Tavsif</h2>
          <p className={styles.description}>{product.description}</p>
        </section>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { BuyBox } from "@/features/product/BuyBox";
import { OptionPicker } from "@/features/product/OptionPicker";
import { defaultOption, productOptions } from "@/lib/product/options";
import { useCatalog } from "@/lib/storefront/CatalogProvider";
import type { Product } from "@/lib/storefront/types";

import styles from "./QuickBuy.module.css";

/** Choosing a colour (or type) from a card, without leaving the list. */
export function QuickBuy({ product, onClose }: { product: Product; onClose: () => void }) {
  const { showStock } = useCatalog();
  const options = productOptions(product);
  const [key, setKey] = useState(() => defaultOption(options)?.key ?? "");
  const option = options.find((o) => o.key === key) ?? options[0];
  if (!option) return null;
  return (
    <Dialog title={product.name} onClose={onClose}>
      <div className={styles.quick}>
        <OptionPicker options={options} selectedKey={option.key} onSelect={(o) => setKey(o.key)} showStock={showStock} />
        <BuyBox key={option.key} product={product} option={option} showStock={showStock} />
        <Link className={styles.details} href={`/product/${product.id}?o=${option.key}`} onClick={onClose}>
          Mahsulot haqida batafsil →
        </Link>
      </div>
    </Dialog>
  );
}

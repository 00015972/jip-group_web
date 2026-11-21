"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stepper } from "@/components/ui/Stepper";
import { cartFeedback } from "@/lib/cart/feedback";
import { commitQty, stepQty } from "@/lib/cart/quantity";
import { useCart } from "@/lib/cart/useCart";
import { colourSwatches } from "@/lib/product/colours";
import { isLowStock, optionPriceGroups, productOptions } from "@/lib/product/options";
import { minQty } from "@/lib/product/units";
import { useCatalog } from "@/lib/storefront/CatalogProvider";
import type { Product } from "@/lib/storefront/types";

import styles from "./ProductCard.module.css";
import { QuickBuy } from "./QuickBuy";

/** Up to this many colour swatches on a card; the rest are counted. */
const SWATCHES = 6;

/**
 * A product tile: the photo filling its square, the name, the price, and a
 * quantity stepper with "Savatga" under them. A product in several colours
 * shows them as swatches (each opens the product on that colour), and its
 * button opens a quick chooser instead.
 */
export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { showImages } = useCatalog();
  const { items, ready, add } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const options = productOptions(product);
  const single = options.length === 1 ? options[0] : null;
  const prices = optionPriceGroups(options);
  const href = `/product/${product.id}`;
  const soldOut = !options.some((o) => o.inStock);
  const low = single && isLowStock(single);

  const colours = colourSwatches(options.filter((o) => o.variantId));
  const swatches = colours ? [...colours] : [];
  const [preview, setPreview] = useState<string | null>(null);
  const image = (preview && options.find((o) => o.key === preview)?.image) || product.image;
  const [quick, setQuick] = useState(false);
  const closeQuick = useCallback(() => setQuick(false), []);
  const inCart = ready ? items.filter((x) => x.product_id === product.id).length : 0;

  const limits = single ? { max: single.stock, decimal: single.decimal } : undefined;
  const [qty, setQty] = useState(() => minQty(single?.decimal ?? false));
  const [added, setAdded] = useState(false);

  return (
    <article className={`${styles.card} ${soldOut ? styles.soldOut : ""}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden>
        {showImages ? <SafeImage key={image} src={image} alt="" sizes="(min-width: 1600px) 380px, (min-width: 1024px) 24vw, (min-width: 768px) 32vw, 50vw" eager={eager} /> : <span className={styles.noPhoto} />}
        {soldOut ? (
          <span className={`${styles.badge} ${styles.badgeMuted}`}>Tugagan</span>
        ) : low ? (
          <span className={styles.badge}>Kam qoldi</span>
        ) : null}
      </Link>

      <h3 className={styles.name}>
        <Link href={href}>{product.name}</Link>
      </h3>

      {swatches.length > 0 && (
        <ul className={styles.swatches} aria-label="Ranglar" onMouseLeave={() => setPreview(null)}>
          {swatches.slice(0, SWATCHES).map(([option, colour]) => (
            <li key={option.key}>
              <Link
                href={`${href}?o=${option.key}`}
                className={`${styles.swatch} ${option.inStock ? "" : styles.swatchOut}`}
                style={{ background: colour.swatch ?? undefined }}
                title={colour.label}
                aria-label={`${product.name}, ${colour.label}`}
                onMouseEnter={() => setPreview(option.key)}
                onFocus={() => setPreview(option.key)}
              />
            </li>
          ))}
          {swatches.length > SWATCHES && <li className={styles.more}>+{swatches.length - SWATCHES}</li>}
        </ul>
      )}

      <div className={styles.price}>
        {prices.map(({ option, varies }) => (
          <Price key={option.key} amount={option.curPrice} currency={option.currency} original={option.originalPrice} from={varies} size="sm" />
        ))}
      </div>

      {!soldOut && (
        <div className={styles.actions}>
          {!single || !limits ? (
            <Button variant="secondary" className={styles.choose} disabled={!options.length} onClick={() => setQuick(true)}>
              {inCart ? `Savatda: ${inCart} ${colours ? "rang" : "xil"}` : colours ? "Rangni tanlash" : "Tanlash"}
            </Button>
          ) : (
            <>
              <Stepper
                size="sm"
                className={styles.stepper}
                label={`${product.name}: miqdor`}
                value={qty}
                decimal={single.decimal}
                canDecrease={qty > minQty(single.decimal)}
                canIncrease={stepQty(qty, 1, limits) > qty}
                onStep={(direction) => setQty(stepQty(qty, direction, limits))}
                onCommit={(draft) => {
                  const next = commitQty(draft, limits);
                  if (next != null) setQty(next);
                }}
              />
              <button
                ref={buttonRef}
                type="button"
                className={styles.add}
                onClick={() => {
                  add(product, single, qty);
                  cartFeedback(buttonRef.current);
                  setQty(minQty(single.decimal));
                  setAdded(true);
                  window.setTimeout(() => setAdded(false), 1600);
                }}
              >
                {added ? (
                  <>
                    <Check size={16} aria-hidden />
                    Qo‘shildi
                  </>
                ) : (
                  "Savatga"
                )}
              </button>
            </>
          )}
        </div>
      )}
      {quick && <QuickBuy product={product} onClose={closeQuick} />}
    </article>
  );
}

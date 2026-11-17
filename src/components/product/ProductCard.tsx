"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { SafeImage } from "@/components/ui/SafeImage";
import { Stepper } from "@/components/ui/Stepper";
import { cartFeedback } from "@/lib/cart/feedback";
import { commitQty, stepQty } from "@/lib/cart/quantity";
import { useCart } from "@/lib/cart/useCart";
import { isLowStock, optionPriceGroups, productOptions } from "@/lib/product/options";
import { minQty } from "@/lib/product/units";
import { useCatalog } from "@/lib/storefront/CatalogProvider";
import type { Product } from "@/lib/storefront/types";

import styles from "./ProductCard.module.css";

/**
 * A product tile: the photo filling its square, the name, the price, and a
 * quantity stepper with "Savatga" under them. A product with several units or
 * variants sends the customer to its page to choose instead.
 */
export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { showImages } = useCatalog();
  const { add } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const options = productOptions(product);
  const single = options.length === 1 ? options[0] : null;
  const prices = optionPriceGroups(options);
  const href = `/product/${product.id}`;
  const soldOut = !options.some((o) => o.inStock);
  const low = single && isLowStock(single);

  const limits = single ? { max: single.stock, decimal: single.decimal } : undefined;
  const [qty, setQty] = useState(() => minQty(single?.decimal ?? false));
  const [added, setAdded] = useState(false);

  return (
    <article className={`${styles.card} ${soldOut ? styles.soldOut : ""}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden>
        {showImages ? <SafeImage src={product.image} alt="" sizes="(min-width: 1600px) 380px, (min-width: 1024px) 24vw, (min-width: 768px) 32vw, 50vw" eager={eager} /> : <span className={styles.noPhoto} />}
        {soldOut ? (
          <span className={`${styles.badge} ${styles.badgeMuted}`}>Tugagan</span>
        ) : low ? (
          <span className={styles.badge}>Kam qoldi</span>
        ) : null}
      </Link>

      <h3 className={styles.name}>
        <Link href={href}>{product.name}</Link>
      </h3>

      <div className={styles.price}>
        {prices.map(({ option, varies }) => (
          <Price key={option.key} amount={option.curPrice} currency={option.currency} original={option.originalPrice} from={varies} size="sm" />
        ))}
      </div>

      {!soldOut && (
        <div className={styles.actions}>
          {!single || !limits ? (
            <ButtonLink href={href} variant="secondary" className={styles.choose}>
              Tanlash
            </ButtonLink>
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
    </article>
  );
}

"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useShopUi } from "@/components/layout/ShopUi";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Stepper } from "@/components/ui/Stepper";
import { cartFeedback } from "@/lib/cart/feedback";
import { capFor, lineKey } from "@/lib/cart/lines";
import { commitQty, stepQty } from "@/lib/cart/quantity";
import { useCart } from "@/lib/cart/useCart";
import { isLowStock, type BuyOption } from "@/lib/product/options";
import { minQty, roundQty } from "@/lib/product/units";
import { fmtNumber, money } from "@/lib/storefront/currency";
import type { Product } from "@/lib/storefront/types";

import styles from "./BuyBox.module.css";

/**
 * Price, quantity and "add to cart" for the chosen option. What the cart
 * already holds counts against the stock, including other units of the same
 * product.
 */
export function BuyBox({ product, option, showStock }: { product: Product; option: BuyOption; showStock: boolean }) {
  const { items, ready, add } = useCart();
  const { open } = useShopUi();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inCart = items.find((x) => x.key === lineKey(product.id, option.key));
  const left = Math.max(0, roundQty(capFor(items, product.id, option) - (inCart?.qty ?? 0), option.decimal));
  const min = minQty(option.decimal);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(timer);
  }, [added]);

  const finished = option.inStock && ready && left < min;
  const value = Math.max(min, Math.min(qty, left));
  const limits = { max: left, decimal: option.decimal };
  const low = isLowStock(option);

  return (
    <section className={styles.box} aria-label="Xarid">
      <div className={styles.priceRow}>
        <Price amount={option.curPrice} currency={option.currency} original={option.originalPrice} alt={option.price} per={option.unit} size="xl" />
      </div>

      <p className={`${styles.stock} ${!option.inStock ? styles.out : low ? styles.low : ""}`}>
        <span className={styles.dot} aria-hidden />
        {!option.inStock
          ? "Hozir omborda yo‘q"
          : showStock && Number.isFinite(option.stock)
            ? `Omborda: ${fmtNumber(option.stock)} ${option.unit}${low ? " · kam qoldi" : ""}`
            : "Omborda bor"}
      </p>

      {option.inStock && !finished && (
        <>
          <div className={styles.qtyRow}>
            <Stepper
              label={`${product.name}: miqdori`}
              value={value}
              decimal={option.decimal}
              suffix={option.unit}
              canDecrease={value > min}
              canIncrease={stepQty(value, 1, limits) > value}
              onStep={(direction) => setQty(stepQty(value, direction, limits))}
              onCommit={(draft) => {
                const next = commitQty(draft, limits);
                if (next != null) setQty(next);
              }}
            />
          </div>

          <dl className={styles.summary}>
            <div>
              <dt>Jami</dt>
              <dd className={styles.total}>{money(option.curPrice * value, option.currency)}</dd>
            </div>
          </dl>

          <Button
            ref={buttonRef}
            size="lg"
            block
            icon={added ? <Check size={20} aria-hidden /> : <ShoppingCart size={20} aria-hidden />}
            onClick={() => {
              add(product, option, value);
              cartFeedback(buttonRef.current);
              setAdded(true);
              setQty(1);
            }}
          >
            {added ? "Qo‘shildi" : "Savatga qo‘shish"}
          </Button>
        </>
      )}

      {finished && <p className={styles.finished}>Ombordagi hamma miqdor savatingizda.</p>}

      {inCart && (
        <button type="button" className={styles.inCart} onClick={() => open("cart")}>
          Savatda: <strong>{fmtNumber(inCart.qty)} {inCart.unit}</strong>
          <span>Savatni ochish →</span>
        </button>
      )}
    </section>
  );
}

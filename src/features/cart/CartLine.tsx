"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";

import { SafeImage } from "@/components/ui/SafeImage";
import { Stepper } from "@/components/ui/Stepper";
import { lineTotal } from "@/lib/cart/lines";
import { commitQty, stepQty } from "@/lib/cart/quantity";
import type { CartItem } from "@/lib/cart/types";
import { fmtNumber, money } from "@/lib/storefront/currency";

import styles from "./CartLine.module.css";

export function productHref(item: Pick<CartItem, "product_id" | "option_key">): string {
  return item.option_key === "base" ? `/product/${item.product_id}` : `/product/${item.product_id}?o=${item.option_key}`;
}

export function CartLine({ item, onQty, onRemove }: { item: CartItem; onQty: (qty: number) => void; onRemove: () => void }) {
  const href = productHref(item);
  const limits = { max: item.max_qty, decimal: item.decimal };

  return (
    <li className={styles.line}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden>
        <SafeImage src={item.image} alt="" sizes="88px" />
      </Link>

      <div className={styles.info}>
        <Link href={href} className={styles.name}>
          {item.name}
        </Link>
        <p className={styles.meta}>
          {item.option_label && <span className={styles.option}>{item.option_label}</span>}
          <span>
            {money(item.cur_price, item.currency)} / {item.unit}
          </span>
        </p>
      </div>

      <div className={styles.controls}>
        <Stepper
          size="sm"
          label={`${item.name}: miqdori`}
          value={item.qty}
          decimal={item.decimal}
          suffix={item.unit}
          canDecrease={stepQty(item.qty, -1, limits) < item.qty}
          canIncrease={stepQty(item.qty, 1, limits) > item.qty}
          onStep={(direction) => onQty(stepQty(item.qty, direction, limits))}
          onCommit={(draft) => {
            const next = commitQty(draft, limits);
            if (next != null) onQty(next);
          }}
        />
        <strong className={styles.total}>{money(lineTotal(item), item.currency)}</strong>
        <button type="button" className={styles.remove} onClick={onRemove} aria-label={`${item.name}: savatdan o'chirish`}>
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
      {item.qty >= item.max_qty && item.max_qty < 999_999 && (
        <p className={styles.cap}>Omborda shuncha bor: {fmtNumber(item.max_qty)} {item.unit}</p>
      )}
    </li>
  );
}

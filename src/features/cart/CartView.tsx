"use client";

import { ShoppingCart } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { totalsInput } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/useCart";
import { groupTotal } from "@/lib/storefront/currency";

import { CartLine } from "./CartLine";
import styles from "./CartView.module.css";

export function CartView() {
  const { items, ready, setQty, remove, clear } = useCart();

  if (!ready) return <div className={styles.skeleton} aria-busy="true" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={32} aria-hidden />}
        title="Savat bo‘sh"
        text="Kerakli mahsulotni katalogdan tanlab, savatga qo‘shing."
        action={<ButtonLink href="/catalog">Katalog</ButtonLink>}
      />
    );
  }

  return (
    <div className={styles.layout}>
      <div>
        <div className={styles.listHead}>
          <h1 className={styles.title}>Savat</h1>
          <Button variant="ghost" size="sm" onClick={clear}>
            Tozalash
          </Button>
        </div>
        <ul className={styles.list}>
          {items.map((item) => (
            <CartLine key={item.key} item={item} onQty={(qty) => setQty(item.key, qty)} onRemove={() => remove(item.key)} />
          ))}
        </ul>
      </div>

      <aside className={styles.summary}>
        <h2 className={styles.summaryTitle}>Buyurtma</h2>
        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Mahsulotlar</dt>
            <dd>{items.length} xil</dd>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <dt>Jami</dt>
            <dd>{groupTotal(totalsInput(items))}</dd>
          </div>
        </dl>
        <ButtonLink href="/checkout" size="lg" block>
          Rasmiylashtirish
        </ButtonLink>
      </aside>
    </div>
  );
}

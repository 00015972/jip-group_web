"use client";

import { ShoppingCart } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CartLine } from "@/features/cart/CartLine";
import { totalsInput } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/useCart";
import { groupTotal } from "@/lib/storefront/currency";

import styles from "./ShopOverlays.module.css";
import { useShopUi } from "./ShopUi";

/** The cart over whatever page is open, with its total. */
function CartSheet() {
  const { close } = useShopUi();
  const { items, ready, setQty, remove } = useCart();
  return (
    <Dialog
      title={`Savat${ready && items.length ? ` · ${items.length}` : ""}`}
      onClose={close}
      side
      footer={
        items.length > 0 && (
          <>
            <p className={styles.total}>
              <span>Jami</span>
              <strong>{groupTotal(totalsInput(items))}</strong>
            </p>
            <div className={styles.actions}>
              <ButtonLink href="/cart" variant="secondary" onClick={close}>
                Savat
              </ButtonLink>
              <ButtonLink href="/checkout" onClick={close}>
                Rasmiylashtirish
              </ButtonLink>
            </div>
          </>
        )
      }
    >
      {!ready ? (
        <p>Yuklanmoqda...</p>
      ) : items.length ? (
        <ul
          className={styles.cartLines}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) close();
          }}
        >
          {items.map((item) => (
            <CartLine key={item.key} item={item} onQty={(qty) => setQty(item.key, qty)} onRemove={() => remove(item.key)} />
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <ShoppingCart size={36} aria-hidden />
          <p className={styles.emptyTitle}>Savat bo‘sh</p>
          <p>Mahsulot sahifasida miqdorni tanlab, savatga qo‘shing.</p>
          <Button onClick={close}>Xaridni davom ettirish</Button>
        </div>
      )}
    </Dialog>
  );
}

export function ShopOverlays() {
  const { overlay } = useShopUi();
  return overlay === "cart" ? <CartSheet /> : null;
}

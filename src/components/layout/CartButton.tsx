"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart/useCart";

import styles from "./CartButton.module.css";
import { useShopUi } from "./ShopUi";

/** "Savat · 2": opens the cart over the current page. */
export function CartButton({ className }: { className?: string }) {
  const { count, ready } = useCart();
  const { open } = useShopUi();
  const shown = ready ? count : 0;
  return (
    <button type="button" onClick={() => open("cart")} className={className} aria-label={`Savat, ${shown} ta mahsulot`} aria-haspopup="dialog">
      <span className={styles.icon} data-cart-target>
        <ShoppingBag size={21} strokeWidth={1.9} aria-hidden />
      </span>
      Savat
      {shown > 0 && <span className={styles.count}>· {shown > 99 ? "99+" : shown}</span>}
    </button>
  );
}

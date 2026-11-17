"use client";

import { ChevronRight, LayoutGrid, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SafeImage } from "@/components/ui/SafeImage";
import { CartLine } from "@/features/cart/CartLine";
import { totalsInput } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/useCart";
import { productsInCategory } from "@/lib/storefront/catalog";
import { useCatalog } from "@/lib/storefront/CatalogProvider";
import { groupTotal } from "@/lib/storefront/currency";

import styles from "./ShopOverlays.module.css";
import { useShopUi } from "./ShopUi";

/**
 * The categories, sliding in from the left like the cart does from the
 * right: all products first, then each top category with its picture and
 * count, and any subcategories under it.
 */
function CategorySheet() {
  const { close } = useShopUi();
  const { categories, categoryImages, products } = useCatalog();
  const tops = categories.filter((c) => !c.parentId);

  return (
    <Dialog title="Kategoriyalar" onClose={close} side="left">
      <ul className={styles.categories}>
        <li>
          <Link href="/catalog" className={styles.category} onClick={close}>
            <span className={`${styles.thumb} ${styles.allThumb}`}>
              <LayoutGrid size={20} aria-hidden />
            </span>
            <span className={styles.categoryText}>
              <span className={styles.categoryName}>Barcha mahsulotlar</span>
              <span className={styles.categoryCount}>{products.length} ta mahsulot</span>
            </span>
            <ChevronRight size={18} className={styles.chevron} aria-hidden />
          </Link>
        </li>
        {tops.map((top) => {
          const children = categories.filter((c) => c.parentId === top.id);
          return (
            <li key={top.id}>
              <Link href={`/catalog?category=${top.id}`} className={styles.category} onClick={close}>
                <span className={styles.thumb}>
                  <SafeImage src={categoryImages[top.id]} alt="" sizes="48px" />
                </span>
                <span className={styles.categoryText}>
                  <span className={styles.categoryName}>{top.name}</span>
                  <span className={styles.categoryCount}>{productsInCategory(products, top.id).length} ta mahsulot</span>
                </span>
                <ChevronRight size={18} className={styles.chevron} aria-hidden />
              </Link>
              {children.length > 0 && (
                <ul className={styles.children}>
                  {children.map((child) => (
                    <li key={child.id}>
                      <Link href={`/catalog?category=${child.id}`} onClick={close}>
                        {child.name.split(" › ").at(-1)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

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
  if (overlay === "catalog") return <CategorySheet />;
  return overlay === "cart" ? <CartSheet /> : null;
}

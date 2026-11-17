"use client";

import { ArrowLeft, Menu, User } from "lucide-react";
import Link from "next/link";

import { useCustomer } from "@/lib/customer/useCustomer";

import styles from "./NavActions.module.css";
import { useShopUi } from "./ShopUi";

/** Opens the categories sheet, like the cart button opens the cart. */
export function CatalogButton({ className }: { className?: string }) {
  const { open, overlay } = useShopUi();
  return (
    <button type="button" className={className} onClick={() => open("catalog")} aria-haspopup="dialog" aria-expanded={overlay === "catalog"} aria-label="Kategoriyalar">
      <Menu size={21} strokeWidth={1.9} aria-hidden />
      <span className={styles.label}>Kategoriyalar</span>
    </button>
  );
}

/** "Kirish" before sign-in; the customer's initial and "Kabinet" after. */
export function AccountLink({ className }: { className?: string }) {
  const { customer, ready } = useCustomer();
  const name = ready && customer ? customer.name || customer.customer_name || customer.customer_code : "";
  return (
    <Link href="/account" className={className} aria-label={name ? `${name}: shaxsiy kabinet` : "Mijoz sifatida kirish"}>
      {name ? <span className={styles.avatar}>{name.charAt(0).toUpperCase()}</span> : <User size={20} strokeWidth={1.9} aria-hidden />}
      <span className={styles.label}>{name ? "Kabinet" : "Kirish"}</span>
    </Link>
  );
}

export function BackButton({ fallback = "/catalog" }: { fallback?: string }) {
  const { back } = useShopUi();
  return (
    <button type="button" className={styles.back} onClick={() => back(fallback)}>
      <ArrowLeft size={16} aria-hidden />
      Orqaga
    </button>
  );
}

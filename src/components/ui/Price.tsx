import { money } from "@/lib/storefront/currency";

import styles from "./Price.module.css";

/** "56 000 so'm / dona", with the old price struck through when discounted. */
export function Price({
  amount,
  currency,
  original,
  per,
  size = "md",
  from = false,
  alt,
}: {
  amount: number;
  currency?: string;
  original?: number | null;
  per?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** A starting price: "56 000 so'm dan". */
  from?: boolean;
  /** The so'm amount the ERP sends beside a USD price. */
  alt?: number | null;
}) {
  const discounted = original != null && original > amount;
  const percent = discounted && original > 0 ? Math.round((1 - amount / original) * 100) : 0;
  return (
    <span className={`${styles.price} ${styles[size]}`}>
      <span className={styles.amount}>{money(amount, currency)}</span>
      {from && <span className={styles.per}>dan</span>}
      {per && <span className={styles.per}>/ {per}</span>}
      {discounted && <s className={styles.original}>{money(original, currency)}</s>}
      {percent > 0 && percent < 100 && <span className={styles.discount}>−{percent}%</span>}
      {currency === "USD" && alt != null && alt > 0 && (
        <span className={styles.alt}>
          ≈ {money(alt, "")}
          {per ? ` / ${per}` : ""}
        </span>
      )}
    </span>
  );
}

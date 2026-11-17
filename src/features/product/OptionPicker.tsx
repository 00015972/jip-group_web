"use client";

import type { BuyOption } from "@/lib/product/options";
import { fmtNumber, money } from "@/lib/storefront/currency";

import styles from "./OptionPicker.module.css";

/**
 * Sizes/grades (variants) or units (dona / poddon) as a row of chips, each
 * with its own price, so they can be compared without clicking through.
 */
export function OptionPicker({
  options,
  selectedKey,
  onSelect,
  showStock,
}: {
  options: BuyOption[];
  selectedKey: string;
  onSelect: (option: BuyOption) => void;
  showStock: boolean;
}) {
  const variants = options.some((o) => o.variantId);
  const base = options.find((o) => o.multiplier === 1) ?? options[0];
  const selected = options.find((o) => o.key === selectedKey);

  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>
        {variants ? "O‘lcham / turi" : "Qanday sotib olasiz"}
        {selected && <span className={styles.current}>: {selected.label}</span>}
      </legend>
      <div className={styles.chips} role="radiogroup">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={option.key === selectedKey}
            className={styles.chip}
            disabled={!option.inStock}
            onClick={() => onSelect(option)}
          >
            <span className={styles.label}>{option.label}</span>
            {!variants && option.multiplier !== 1 && (
              <span className={styles.sub}>
                {fmtNumber(option.multiplier)} {base.unit}
              </span>
            )}
            <span className={styles.price}>
              {money(option.curPrice, option.currency)} / {option.unit}
            </span>
            {!option.inStock ? (
              <span className={styles.sub}>Tugagan</span>
            ) : (
              showStock &&
              Number.isFinite(option.stock) && (
                <span className={styles.sub}>
                  {fmtNumber(option.stock)} {option.unit} bor
                </span>
              )
            )}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

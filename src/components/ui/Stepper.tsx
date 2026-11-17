"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import styles from "./Stepper.module.css";

/**
 * − value + with a typable value. The draft is only applied on blur/Enter,
 * so clearing "1" to type "2000" does not jump through intermediate values.
 */
export function Stepper({
  value,
  onStep,
  onCommit,
  canDecrease = true,
  canIncrease = true,
  decimal = false,
  suffix,
  label,
  size = "md",
  className,
}: {
  value: number;
  onStep: (direction: 1 | -1) => void;
  /** Receives the typed text; the parent decides the value. */
  onCommit: (draft: string) => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
  /** Measured goods accept "2,5". */
  decimal?: boolean;
  suffix?: string;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft != null) onCommit(draft);
    setDraft(null);
  };

  return (
    <div className={[styles.stepper, styles[size], className].filter(Boolean).join(" ")}>
      <button type="button" className={styles.button} onClick={() => onStep(-1)} disabled={!canDecrease} aria-label="Kamaytirish">
        <Minus size={16} aria-hidden />
      </button>
      <label className={styles.field}>
        <span className="sr-only">{label}</span>
        <input
          className={styles.input}
          inputMode={decimal ? "decimal" : "numeric"}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          size={Math.max(2, String(draft ?? value).length)}
        />
        {suffix && (
          <span className={styles.suffix} aria-hidden>
            {suffix}
          </span>
        )}
      </label>
      <button type="button" className={styles.button} onClick={() => onStep(1)} disabled={!canIncrease} aria-label="Ko‘paytirish">
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}

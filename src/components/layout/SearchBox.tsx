"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { SafeImage } from "@/components/ui/SafeImage";
import { optionPriceGroups, productOptions } from "@/lib/product/options";
import { matchesSearch, searchSuggestions } from "@/lib/storefront/catalog";
import { useCatalog } from "@/lib/storefront/CatalogProvider";
import { money } from "@/lib/storefront/currency";

import styles from "./SearchBox.module.css";

/**
 * Search by name, article or description, with suggestions as you type.
 * Enter opens the full results on the catalog page.
 */
export function SearchBox({ expanded = false, onNavigate }: { expanded?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const { products } = useCatalog();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const { results, exact } = useMemo(() => {
    if (!trimmed) return { results: [], exact: true };
    const found = products.filter((p) => matchesSearch(p, trimmed));
    return found.length
      ? { results: found.slice(0, 6), exact: true }
      : { results: searchSuggestions(trimmed, products, 6), exact: false };
  }, [products, trimmed]);

  const go = () => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog");
    onNavigate?.();
  };

  return (
    <form
      role="search"
      className={`${styles.form} ${expanded ? styles.expanded : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        go();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Search size={18} className={styles.icon} aria-hidden />
      <input
        ref={inputRef}
        data-autofocus={expanded ? "" : undefined}
        className={styles.input}
        type="search"
        placeholder="Konteyner, bak, stol-stul…"
        aria-label="Qidirish"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && Boolean(trimmed)}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />
      {query && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Tozalash"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <X size={16} aria-hidden />
        </button>
      )}

      {open && trimmed && (
        <div id={listId} className={styles.panel}>
          {results.length === 0 ? (
            <p className={styles.note}>Hech narsa topilmadi</p>
          ) : (
            <>
              {!exact && <p className={styles.note}>Aniq mos kelmadi. Balki shular:</p>}
              <ul>
                {results.map((p) => {
                  const prices = optionPriceGroups(productOptions(p));
                  return (
                    <li key={p.id}>
                      <Link href={`/product/${p.id}`} className={styles.result} onClick={() => { setOpen(false); onNavigate?.(); }}>
                        <span className={styles.thumb}>
                          <SafeImage src={p.image} alt="" sizes="44px" />
                        </span>
                        <span className={styles.resultText}>
                          <span className={styles.resultName}>{p.name}</span>
                          <span className={styles.resultMeta}>
                            {prices.map(({ option, varies }) => `${money(option.curPrice, option.currency)}${varies ? " dan" : ""} / ${option.unit}`).join(" · ")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {exact && (
                <button type="submit" className={styles.all}>
                  Barcha natijalar
                </button>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}

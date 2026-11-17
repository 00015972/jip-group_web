"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./RevealList.module.css";

/** Per card in a row, so a row comes in left to right (bekplast.uz's rhythm). */
const STAGGER_MS = 160;

/**
 * A list whose items drop into place as they come into view, the first row on
 * page load and the rest as the visitor scrolls (like bekplast.uz).
 *
 * Items arrive from the server with the \`pending\` class (hidden, with a CSS
 * fallback that shows them anyway if scripts never run). On mount this takes
 * over: each pending item waits hidden until it intersects the viewport, then
 * animates in. Safe under React's double mount in development: the cleanup
 * puts items that have not shown yet back to pending, so the next mount picks
 * them up again.
 */
export function RevealList({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const items = [...list.children] as HTMLElement[];
    const pending = items.filter((item) => item.classList.contains(styles.pending));
    if (!pending.length) return;

    const show = (item: HTMLElement, delay: number) => {
      item.style.setProperty("--reveal-delay", `${delay}ms`);
      item.classList.remove(styles.pending, styles.hidden);
      item.classList.add(styles.shown);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      for (const item of pending) show(item, 0);
      return;
    }

    const columns = () => Math.max(1, getComputedStyle(list).gridTemplateColumns.split(" ").filter(Boolean).length);
    const observer = new IntersectionObserver(
      (entries) => {
        const perRow = columns();
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = entry.target as HTMLElement;
          observer.unobserve(item);
          show(item, (items.indexOf(item) % perRow) * STAGGER_MS);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    for (const item of pending) {
      // The CSS fallback already showed it (scripts were slow): leave it be.
      if (getComputedStyle(item).opacity === "1") {
        show(item, 0);
        continue;
      }
      item.classList.replace(styles.pending, styles.hidden);
      observer.observe(item);
    }

    return () => {
      observer.disconnect();
      for (const item of items) item.classList.replace(styles.hidden, styles.pending);
    };
  });

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}

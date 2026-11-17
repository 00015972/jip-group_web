"use client";

import { useEffect, useRef, useState } from "react";

import { SafeImage } from "@/components/ui/SafeImage";
import { useReducedMotion } from "@/lib/motion";
import type { StoreBanner } from "@/lib/storefront/types";

import styles from "./HeroBanners.module.css";

/**
 * The ERP banners, full width at 3:1 (the shape the shop's banners are made
 * in, 1920×640); a banner of another shape is cropped to fill.
 * Several banners rotate every 5 s unless the visitor has touched them, is
 * hovering, or prefers reduced motion.
 */
export function HeroBanners({ banners }: { banners: StoreBanner[] }) {
  const viewport = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const go = (next: number) => {
    const el = viewport.current;
    if (el) el.scrollTo({ left: ((next + banners.length) % banners.length) * el.clientWidth, behavior: reduce ? "instant" : "smooth" });
  };

  useEffect(() => {
    if (paused || reduce || banners.length < 2) return;
    const timer = setInterval(() => {
      const el = viewport.current;
      if (!el || document.hidden) return;
      el.scrollTo({ left: ((Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length) * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, reduce, banners.length]);

  return (
    <section
      className={styles.frame}
      aria-label="Bannerlar"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onFocus={() => setPaused(true)}
    >
      <ul
        ref={viewport}
        className={styles.strip}
        onPointerDown={() => setPaused(true)}
        onScroll={() => {
          const el = viewport.current;
          if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {banners.map((b, i) => (
          <li key={`${b.image}-${i}`} className={styles.slide} aria-roledescription="slide" aria-label={`${i + 1} / ${banners.length}`}>
            <SafeImage src={b.image} alt={b.title} sizes="(min-width: 1600px) 1520px, 96vw" eager={i === 0} className={styles.photo} />
          </li>
        ))}
      </ul>
      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((_, i) => (
            <button key={i} type="button" className={styles.dot} aria-label={`Banner ${i + 1}`} aria-current={i === index ? "true" : undefined} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </section>
  );
}

import { Container } from "@/components/ui/Container";
import type { StoreBanner } from "@/lib/storefront/types";

import styles from "./Hero.module.css";
import { HeroBanners } from "./HeroBanners";

const HEADLINE = "Plastik baklar, konteynerlar va stol-stullar";

/**
 * The top of the home page: the shop's ERP banners with the headline over
 * their empty left side (the banners are made with that side clear).
 */
export function Hero({ banners }: { banners: StoreBanner[] }) {
  return (
    <Container className={styles.hero}>
      <div className={styles.stage}>
        <h1 className={`${styles.title} ${banners.length ? styles.over : ""}`}>{HEADLINE}</h1>
        {banners.length > 0 && <HeroBanners banners={banners} />}
      </div>
    </Container>
  );
}

import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { BRAND } from "@/config/store";

import { CartButton } from "./CartButton";
import styles from "./Header.module.css";
import { AccountLink, CatalogButton } from "./NavActions";
import { SearchBox } from "./SearchBox";

/** The blue bar: categories, logo, search, account and cart. On phones the search drops to its own row. */
export function Header() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <CatalogButton className={styles.action} />
        <Link href="/" className={styles.brand} aria-label={`${BRAND}, bosh sahifa`}>
          <Image src="/logo-white.png" alt="" width={312} height={156} priority unoptimized className={styles.logo} />
        </Link>
        <div className={styles.search}>
          <SearchBox />
        </div>
        <nav className={styles.actions} aria-label="Foydalanuvchi">
          <AccountLink className={styles.action} />
          <CartButton className={styles.action} />
        </nav>
      </Container>
    </header>
  );
}

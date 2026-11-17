import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { BRAND, STORE_CONTACT, telHref } from "@/config/store";

import styles from "./Footer.module.css";

export function Footer() {
  const { phones, address, landmark } = STORE_CONTACT;
  const hasContact = phones.length > 0 || address;

  return (
    <footer className={styles.footer}>
      <Container className={styles.grid}>
        <div className={styles.about}>
          <Image src="/logo-white.png" alt={BRAND} width={312} height={156} unoptimized className={styles.logo} />
          <p>To‘lov naqd yoki karta orqali.</p>
        </div>

        {hasContact && (
          <div>
            <p className={styles.heading}>Aloqa</p>
            <ul className={styles.list}>
              {address && (
                <li>
                  {address}
                  {landmark && <> · {landmark}</>}
                </li>
              )}
              {phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)} className={styles.phone}>
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <ul className={styles.list}>
            <li>
              <Link href="/privacy">Maxfiylik siyosati</Link>
            </li>
            <li>
              © {new Date().getFullYear()} {BRAND}
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}

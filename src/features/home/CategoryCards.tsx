import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { SafeImage } from "@/components/ui/SafeImage";
import { Container } from "@/components/ui/Container";

import styles from "./CategoryCards.module.css";
import { SectionHeading } from "./SectionHeading";

export interface CategoryCard {
  id: number;
  name: string;
  count: number;
  /** The ERP's category image, else a product photo from it. */
  image: string;
}

/** One card per top category: its picture, name and how many products. */
export function CategoryCards({ categories }: { categories: CategoryCard[] }) {
  return (
    <Container className={styles.section}>
      <SectionHeading title="Kategoriyalar" />
      <ul className={styles.grid}>
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/catalog?category=${c.id}`} className={styles.card}>
              <span className={styles.thumb}>
                <SafeImage src={c.image} alt="" sizes="72px" />
              </span>
              <span className={styles.text}>
                <span className={styles.name}>{c.name}</span>
                <span className={styles.count}>{c.count} ta mahsulot</span>
              </span>
              <ChevronRight size={18} className={styles.chevron} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

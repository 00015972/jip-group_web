import styles from "./SectionHeading.module.css";

/** "Barcha mahsulotlar ··········· 9 ta mahsulot" */
export function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className={styles.heading}>
      <h2 className={styles.title}>{title}</h2>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}

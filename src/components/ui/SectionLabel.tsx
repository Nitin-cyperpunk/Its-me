import styles from "@/components/sections/scenes.module.css";

// "01 — ABOUT": the eyebrow above every scene heading.
export default function SectionLabel({ index, children }: { index: string; children: string }) {
  return (
    <p className={styles.label} data-reveal="label">
      <span className={styles.labelIndex}>{index}</span>
      {children}
    </p>
  );
}

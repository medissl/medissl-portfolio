import Link from "next/link";
import styles from "./mine-loading.module.css";

export function MineLoading({ stage = "Preparing the cave and project archive." }: { stage?: string }) {
  return <section className={styles.entry} aria-label="Entering the crystal mine">
    <div className={styles.content} role="status">
      <p className={styles.brand}>MEDISSL</p>
      <span className={styles.mineral} aria-hidden="true">◇</span>
      <h1>Into the crystal mine.</h1>
      <p>{stage}</p>
      <progress className={styles.progress} aria-label={stage} />
    </div>
    <Link className={styles.alternative} href="/mine?view=projects">Browse without 3D →</Link>
  </section>;
}

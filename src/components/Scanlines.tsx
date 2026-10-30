import styles from './Scanlines.module.css';

/** Faint CRT scanline + vignette overlay. Purely decorative. */
export function Scanlines() {
  return <div className={styles.scanlines} aria-hidden="true" />;
}

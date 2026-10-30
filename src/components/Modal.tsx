import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../hooks/useFocusTrap';
import styles from './Modal.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Small label above the title, e.g. `cat projects/spendsense.md`. */
  eyebrow?: string;
}

/** Accessible dialog: focus trap, Escape / backdrop to close, body scroll lock, portal. */
export function Modal({ title, onClose, children, eyebrow }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useFocusTrap(dialogRef, true, onClose);

  useEffect(() => {
    document.body.classList.add('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, []);

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.bar}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

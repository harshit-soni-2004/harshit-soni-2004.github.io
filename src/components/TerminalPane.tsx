import { useEffect, useRef } from 'react';
import { useStore } from '../state/store';
import styles from './TerminalPane.module.css';

interface Props {
  onClose: () => void;
}

/** Scrollable output log for the command bar. Announced politely to screen readers. */
export function TerminalPane({ onClose }: Props) {
  const open = useStore((s) => s.terminalOpen);
  const lines = useStore((s) => s.lines);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines, open]);

  return (
    <div id="terminal-output" className={styles.pane} hidden={!open}>
      <div className={styles.toolbar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.title}>terminal — output</span>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close terminal output"
        >
          esc ✕
        </button>
      </div>
      <div className={styles.body} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.length === 0 && (
          <p className={styles.muted}>
            Welcome! Type <code>help</code> to see commands, or just use the links — no typing
            required.
          </p>
        )}
        {lines.map((line) => (
          <div key={line.id} className={`${styles.line} ${styles[line.kind] ?? ''}`}>
            {line.href ? (
              <a
                href={line.href}
                target={line.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                {line.text}
              </a>
            ) : (
              line.text || '\u00a0'
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

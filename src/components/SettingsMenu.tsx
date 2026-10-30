import { useEffect, useId, useRef, useState } from 'react';
import { PALETTE_NAMES } from '../hooks/useTerminal';
import { useStore } from '../state/store';
import type { EffectName } from '../terminal/types';
import styles from './SettingsMenu.module.css';

const EFFECTS: { id: EffectName; label: string }[] = [
  { id: '3d', label: '3D background' },
  { id: 'bloom', label: 'Neon bloom' },
  { id: 'scanlines', label: 'CRT scanlines' },
  { id: 'glitch', label: 'Glitch text' },
];

/** Popover with effect toggles and palette picker (same state as the `theme` command). */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const effects = useStore((s) => s.effects);
  const palette = useStore((s) => s.palette);
  const setEffect = useStore((s) => s.setEffect);
  const setPalette = useStore((s) => s.setPalette);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Visual effects settings"
        onClick={() => setOpen((o) => !o)}
      >
        fx
      </button>
      {open && (
        <div
          id={panelId}
          className={`panel ${styles.panel}`}
          role="group"
          aria-label="Visual effects"
        >
          <p className={styles.heading}>effects</p>
          {EFFECTS.map((e) => (
            <label key={e.id} className={styles.toggle}>
              <input
                type="checkbox"
                checked={effects[e.id]}
                onChange={(ev) => setEffect(e.id, ev.target.checked)}
              />
              <span className={styles.switch} aria-hidden="true" />
              {e.label}
            </label>
          ))}
          <p className={styles.heading}>palette</p>
          <div className={styles.palettes}>
            {PALETTE_NAMES.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.palette}
                aria-pressed={palette === p}
                onClick={() => setPalette(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

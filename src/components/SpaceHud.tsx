import { useEffect, useRef, type KeyboardEvent } from 'react';
import { spaceObjects } from '../data';
import { sendSpaceCommand, setPlayground, useStore } from '../state/store';
import type { SpaceKind } from '../terminal/types';
import styles from './SpaceHud.module.css';

const ICON: Record<SpaceKind, string> = {
  station: '◎',
  saucer: '◓',
  ball: '⚽',
  rocket: '▲',
  delorean: '⚡',
  falcon: '◐',
  walle: '▣',
  milano: '➶',
};

/**
 * DOM layer for the floating space objects: kick counter, playground hint bar, a keyboard
 * toolbar (focus / spin / kick / launch), the info card and a screen-reader live region.
 */
export default function SpaceHud() {
  const playground = useStore((s) => s.playground);
  const kicks = useStore((s) => s.kicks);
  const instances = useStore((s) => s.spaceInstances);
  const focus = useStore((s) => s.spaceFocus);
  const tooltip = useStore((s) => s.spaceTooltip);
  const dragMode = useStore((s) => s.spaceDragMode);
  const announcement = useStore((s) => s.spaceAnnouncement);
  const s = useStore.getState;

  useEffect(() => {
    if (!playground) s().setSpaceFocus(null);
  }, [playground, s]);

  const selected =
    instances.find((i) => i.id === focus) ?? instances.find((i) => i.type !== 'ball');

  return (
    <>
      {kicks > 0 && (
        <div className={styles.kicks} aria-hidden="true">
          kicks: {kicks}
        </div>
      )}

      {playground && (
        <div className={styles.dock} data-occluder>
          <p className={styles.hint}>
            drag to rotate · shift+drag to move · click to interact · double-click for info ·{' '}
            <kbd>Esc</kbd> to exit
          </p>
          <div role="toolbar" aria-label="Space objects" className={styles.toolbar}>
            {instances.map((i) => (
              <button
                key={i.id}
                type="button"
                className={styles.btn}
                aria-pressed={focus === i.id}
                aria-label={`${i.label}. Select; press Enter again for info.`}
                onFocus={() => s().setSpaceFocus(i.id)}
                onClick={() => {
                  if (focus === i.id) s().setSpaceTooltip(i.dataId);
                  else s().setSpaceFocus(i.id);
                }}
              >
                <span aria-hidden="true">{ICON[i.type]}</span> {i.label}
              </button>
            ))}
            <span className={styles.sep} aria-hidden="true" />
            <button
              type="button"
              className={styles.btn}
              disabled={!selected}
              aria-label={selected ? `Spin or interact with ${selected.label}` : 'Spin'}
              onClick={() => selected && sendSpaceCommand({ type: 'interact', id: selected.id })}
            >
              spin
            </button>
            <button
              type="button"
              className={styles.btn}
              aria-label="Kick the football"
              onClick={() => sendSpaceCommand({ type: 'kick' })}
            >
              kick
            </button>
            <button
              type="button"
              className={styles.btn}
              aria-label="Launch the ships"
              onClick={() => sendSpaceCommand({ type: 'launch' })}
            >
              launch
            </button>
            <button
              type="button"
              className={styles.btn}
              aria-pressed={dragMode === 'move'}
              aria-label="Drag moves objects instead of rotating them"
              onClick={() => s().setSpaceDragMode(dragMode === 'move' ? 'rotate' : 'move')}
            >
              move mode
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.exit}`}
              aria-label="Exit playground mode"
              onClick={() => setPlayground(false)}
            >
              exit
            </button>
          </div>
        </div>
      )}

      {tooltip && <InfoCard dataId={tooltip} onClose={() => s().setSpaceTooltip(null)} />}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </>
  );
}

function InfoCard({ dataId, onClose }: { dataId: string; onClose: () => void }) {
  const entry = spaceObjects.find((e) => e.id === dataId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previous?.focus?.();
  }, [dataId]);

  if (!entry) return null;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className={styles.card}
      role="dialog"
      aria-labelledby="space-card-title"
      data-occluder
      onKeyDown={onKeyDown}
    >
      <div className={styles.cardBar}>
        <span id="space-card-title">
          <span className={styles.dollar}>$</span> cat {entry.tooltipTitle}
        </span>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <p className={styles.cardLabel}>{entry.label}</p>
      <p className={styles.cardText}>{entry.tooltipText}</p>
    </div>
  );
}

import type { ReactNode } from 'react';
import { calmPanels } from '../config/theme';
import type { SectionId } from '../terminal/types';
import { GlitchText } from './GlitchText';
import styles from './Section.module.css';

interface Props {
  id: SectionId;
  index: string;
  title: string;
  /** Fake shell command shown in the window title bar, e.g. `cat about.md`. */
  command: string;
  children: ReactNode;
}

/**
 * Terminal-style window panel. The body is a semi-opaque, blurred surface so grid lines never
 * run through text. The heading is focusable so panel switches can move focus to it.
 */
export function Section({ id, index, title, command, children }: Props) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={styles.window}
      aria-labelledby={headingId}
      data-occluder
      data-calm-zone={calmPanels.includes(id) || undefined}
    >
      <div className={styles.titleBar} aria-hidden="true">
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.path}>
          <span className={styles.dollar}>$</span> {command}
        </span>
        <span className={styles.tab}>[{Number(index)}]</span>
      </div>
      <div className={styles.body} data-panel-body>
        <h2 className={styles.title} id={headingId} tabIndex={-1}>
          <span className={styles.index} aria-hidden="true">
            {index}.
          </span>
          <GlitchText text={title} />
        </h2>
        {children}
      </div>
    </section>
  );
}

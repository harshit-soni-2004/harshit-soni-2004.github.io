import { useEffect, useMemo, useState } from 'react';
import { bootConfig } from '../config/theme';
import { papers, profile, researchProjects, skillGroups, sortedProjects } from '../data';
import styles from './BootSequence.module.css';

export const BOOT_SESSION_KEY = 'hs-portfolio-booted';

interface Props {
  reducedMotion: boolean;
  onDone: () => void;
}

/** Boot log lines, generated from the data files so counts stay accurate. */
function buildLog(): { status: 'OK' | 'INFO'; text: string }[] {
  return [
    { status: 'INFO', text: 'BIOS v2.6 — neon-terminal firmware' },
    { status: 'OK', text: 'Initializing kernel modules' },
    { status: 'OK', text: `Mounted /home/${profile.handle}` },
    { status: 'OK', text: `Loaded ${sortedProjects.length} projects` },
    {
      status: 'OK',
      text: `Indexed ${papers.length} papers, ${researchProjects.length} research projects`,
    },
    { status: 'OK', text: `Linked ${skillGroups.reduce((n, g) => n + g.skills.length, 0)} skills` },
    { status: 'OK', text: 'Starting display server (WebGL)' },
    { status: 'INFO', text: `Welcome, visitor. Booting ${profile.name}'s portfolio…` },
  ];
}

/**
 * Fake terminal boot (~2s). Skippable with any key, click or tap; shown once per session.
 */
export function BootSequence({ reducedMotion, onDone }: Props) {
  const log = useMemo(buildLog, []);
  const [visible, setVisible] = useState(reducedMotion ? log.length : 0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const finish = () => setLeaving(true);
    const step = bootConfig.durationMs / (log.length + 1);
    const timers: number[] = [];
    if (!reducedMotion) {
      log.forEach((_, i) =>
        timers.push(window.setTimeout(() => setVisible(i + 1), step * (i + 1))),
      );
    }
    timers.push(window.setTimeout(finish, reducedMotion ? 600 : bootConfig.durationMs + 250));

    const skip = () => finish();
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [log, reducedMotion]);

  useEffect(() => {
    if (!leaving) return;
    sessionStorage.setItem(BOOT_SESSION_KEY, '1');
    const t = window.setTimeout(onDone, reducedMotion ? 0 : 280);
    return () => clearTimeout(t);
  }, [leaving, onDone, reducedMotion]);

  return (
    <div className={`${styles.boot} ${leaving ? styles.leaving : ''}`} role="status">
      <span className="visually-hidden">Loading portfolio. Press any key to skip.</span>
      <div className={styles.log} aria-hidden="true">
        {log.slice(0, visible).map((line, i) => (
          <div key={i} className={styles.line}>
            <span className={line.status === 'OK' ? styles.ok : styles.info}>
              [ {line.status.padEnd(4)}]
            </span>{' '}
            {line.text}
          </div>
        ))}
        <span className="cursor" />
      </div>
      <p className={styles.hint} aria-hidden="true">
        press any key to skip
      </p>
    </div>
  );
}

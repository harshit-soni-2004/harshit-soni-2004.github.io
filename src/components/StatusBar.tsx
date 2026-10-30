import { useEffect, useRef, useState } from 'react';
import { profile } from '../data';
import { SECTION_IDS, type SectionId } from '../terminal/types';
import styles from './StatusBar.module.css';

function useClock(): string {
  const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/** tmux-style status line: clickable panel list, hints and a clock. Announces panel changes. */
export function StatusBar({ active }: { active: SectionId }) {
  const time = useClock();
  const index = SECTION_IDS.indexOf(active);
  const navRef = useRef<HTMLElement>(null);

  // Keep the active window label visible when the list overflows on narrow screens.
  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !link) return;
    const offset = link.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    nav.scrollLeft += offset - (nav.clientWidth - link.offsetWidth) / 2;
  }, [active]);

  return (
    <footer className={styles.bar} data-occluder>
      <span className={styles.session} aria-hidden="true">
        [{profile.handle}]
      </span>
      <nav ref={navRef} aria-label="Panels" className={styles.windows}>
        <ul>
          {SECTION_IDS.map((id, i) => (
            <li key={id}>
              <a
                href={id === 'home' ? '#/' : `#/${id}`}
                className={id === active ? styles.active : undefined}
                aria-current={id === active ? 'page' : undefined}
              >
                {i}:{id}
                {id === active ? '*' : ''}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className={styles.hints} aria-hidden="true">
        ←/→ · 0-6 · / · ctrl+k
      </span>
      <span className={styles.clock} aria-hidden="true">
        {time}
      </span>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {`Panel ${index} of ${SECTION_IDS.length - 1}: ${active}`}
      </p>
    </footer>
  );
}

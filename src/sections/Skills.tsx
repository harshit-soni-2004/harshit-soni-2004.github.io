import { lazy, Suspense, useMemo, useState } from 'react';
import { Section } from '../components/Section';
import { skillGroups } from '../data';
import { hasWebGL } from '../hooks/useWebGLSupport';
import styles from './Skills.module.css';

const SkillSphere = lazy(() => import('../three/SkillSphere'));

export function Skills({ reducedMotion }: { reducedMotion: boolean }) {
  const [view, setView] = useState<'list' | 'sphere'>('list');
  const allSkills = useMemo(() => skillGroups.flatMap((g) => g.skills.map((s) => s.name)), []);
  const webgl = useMemo(hasWebGL, []);

  return (
    <Section id="skills" index="06" title="skills" command="cat /etc/skills.conf">
      <div className={styles.toggle} role="group" aria-label="Skills view">
        <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>
          list
        </button>
        <button
          type="button"
          aria-pressed={view === 'sphere'}
          onClick={() => setView('sphere')}
          disabled={!webgl}
          title={webgl ? 'Interactive 3D sphere' : 'WebGL not available'}
        >
          3d sphere
        </button>
      </div>

      {view === 'sphere' && webgl ? (
        <div className={`panel ${styles.sphere}`}>
          <Suspense fallback={<p className={styles.loading}>loading sphere…</p>}>
            <SkillSphere skills={allSkills} reducedMotion={reducedMotion} />
          </Suspense>
          <p className={styles.sphereHint}>drag to rotate · full list below</p>
        </div>
      ) : null}

      <div className={styles.groups}>
        {skillGroups.map((g) => (
          <section
            key={g.id}
            className={`panel ${styles.group}`}
            aria-labelledby={`skills-${g.id}`}
          >
            <h3 id={`skills-${g.id}`} className={styles.groupTitle}>
              <span aria-hidden="true">[</span>
              {g.title}
              <span aria-hidden="true">]</span>
            </h3>
            <ul className={styles.list}>
              {g.skills.map((s) =>
                s.level !== undefined ? (
                  <li key={s.name} className={styles.bar}>
                    <span className={styles.barLabel}>{s.name}</span>
                    <span
                      className={styles.barTrack}
                      role="meter"
                      aria-label={s.name}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={s.level}
                    >
                      <span className={styles.barFill} style={{ width: `${s.level}%` }} />
                    </span>
                  </li>
                ) : (
                  <li key={s.name} className={styles.tag}>
                    {s.name}
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}

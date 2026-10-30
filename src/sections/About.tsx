import { Section } from '../components/Section';
import { certifications, education, profile, stats } from '../data';
import { formatMonth } from '../utils/format';
import styles from './About.module.css';

const STAT_LABELS: { key: keyof typeof stats; label: string; href: string }[] = [
  { key: 'projects', label: 'projects', href: '#/projects' },
  { key: 'papers', label: 'papers', href: '#/research' },
  { key: 'researchProjects', label: 'research projects', href: '#/lab' },
  { key: 'roles', label: 'roles', href: '#/experience' },
  { key: 'technologies', label: 'technologies', href: '#/skills' },
];

export function About() {
  return (
    <Section id="about" index="01" title="about" command="cat about.md">
      <div className={styles.layout}>
        <div className={styles.bio}>
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className={styles.meta}>
            <span>📍 {profile.location}</span>
            {profile.availability && (
              <span className={styles.available}>● {profile.availability}</span>
            )}
          </p>
        </div>

        <ul className={styles.stats} aria-label="Quick stats">
          {STAT_LABELS.map((s) => (
            <li key={s.key}>
              <a href={s.href} className={`panel ${styles.stat}`}>
                <span className={styles.statValue}>{String(stats[s.key]).padStart(2, '0')}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.columns}>
        <div>
          <h3 className={styles.h3}>## education</h3>
          <ul className={styles.list}>
            {education.map((e) => (
              <li key={e.id} className={`panel ${styles.item}`}>
                <p className={styles.itemTitle}>{e.degree}</p>
                <p className={styles.itemSub}>{e.institution}</p>
                <p className={styles.itemMeta}>
                  {e.start ? `${formatMonth(e.start)} — ` : ''}
                  {formatMonth(e.end)}
                  {e.score ? ` · ${e.score}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {certifications.length > 0 && (
            <>
              <h3 className={styles.h3}>## certifications</h3>
              <ul className={styles.list}>
                {certifications.map((c) => (
                  <li key={c.id} className={`panel ${styles.item}`}>
                    <p className={styles.itemTitle}>
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noreferrer">
                          {c.name} ↗
                        </a>
                      ) : (
                        c.name
                      )}
                    </p>
                    <p className={styles.itemMeta}>
                      {c.issuer} · {formatMonth(c.date)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <>
              <h3 className={styles.h3}>## off-screen</h3>
              <ul className={styles.interests}>
                {profile.interests.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

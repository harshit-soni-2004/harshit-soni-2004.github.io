import { Section } from '../components/Section';
import { experience, profile } from '../data';
import { formatRange, shortHash } from '../utils/format';
import styles from './Experience.module.css';

/** Work history rendered like `git log --graph`. */
export function Experience() {
  return (
    <Section
      id="experience"
      index="05"
      title="experience"
      command="git log --graph --oneline career"
    >
      <ol className={styles.log}>
        {experience.map((e, i) => (
          <li key={e.id} className={styles.commit}>
            <span className={styles.node} aria-hidden="true" />
            <div className={styles.body}>
              <p className={styles.hashLine}>
                <span className={styles.hash}>commit {shortHash(e.id)}</span>
                {i === 0 && <span className={styles.head}>(HEAD -&gt; main)</span>}
                <span className={styles.type}>{e.type}</span>
              </p>
              <p className={styles.metaLine}>
                Author: {profile.name} · {e.location}
              </p>
              <p className={styles.metaLine}>Date: {formatRange(e.start, e.end)}</p>
              <h3 className={styles.title}>
                {e.role} <span className={styles.at}>@</span> {e.company}
              </h3>
              <ul className={styles.highlights}>
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {e.tech.length > 0 && (
                <ul className={styles.tech} aria-label="Technologies">
                  {e.tech.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

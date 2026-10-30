import { CopyButton } from '../components/CopyButton';
import { Section } from '../components/Section';
import { asset } from '../config/site';
import { profile } from '../data';
import styles from './Contact.module.css';

export function Contact() {
  const external = profile.socials.filter((s) => !s.url.startsWith('mailto:'));

  return (
    <Section id="contact" index="08" title="contact" command="./contact --open">
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p>
            Open to DevOps, cloud and full-stack roles
            {profile.availability ? ` — ${profile.availability.toLowerCase()}` : ''}. The fastest
            way to reach me is email.
          </p>
          <div className={styles.actions}>
            <a className="btn" href={`mailto:${profile.email}`}>
              ✉ {profile.email}
            </a>
            <CopyButton text={profile.email} label="copy email" />
          </div>
          <ul className={styles.socials}>
            {external.map((s) => (
              <li key={s.label}>
                <a className="btn btn--ghost" href={s.url} target="_blank" rel="noreferrer">
                  {s.label} ↗
                </a>
              </li>
            ))}
            <li>
              <a className="btn btn--magenta" href={asset(profile.resumePath)} download>
                ↓ resume.pdf
              </a>
            </li>
          </ul>
        </div>

        <div className={`panel ${styles.terminal}`}>
          <div className={styles.bar} aria-hidden="true">
            <i />
            <i />
            <i />
            <span>contact.json</span>
          </div>
          <pre className={styles.code}>
            <span className={styles.prompt}>$ </span>cat contact.json{'\n'}
            {'{\n'}
            {'  '}
            <span className={styles.key}>"name"</span>:{' '}
            <span className={styles.str}>"{profile.name}"</span>,{'\n'}
            {'  '}
            <span className={styles.key}>"location"</span>:{' '}
            <span className={styles.str}>"{profile.location}"</span>,{'\n'}
            {'  '}
            <span className={styles.key}>"email"</span>:{' '}
            <a className={styles.str} href={`mailto:${profile.email}`}>
              "{profile.email}"
            </a>
            ,{'\n'}
            {profile.phone && (
              <>
                {'  '}
                <span className={styles.key}>"phone"</span>:{' '}
                <a className={styles.str} href={`tel:${profile.phone.replace(/\s/g, '')}`}>
                  "{profile.phone}"
                </a>
                ,{'\n'}
              </>
            )}
            {external.map((s, i) => (
              <span key={s.label}>
                {'  '}
                <span className={styles.key}>"{s.label.toLowerCase()}"</span>:{' '}
                <a className={styles.str} href={s.url} target="_blank" rel="noreferrer">
                  "{s.url.replace(/^https?:\/\/(www\.)?/, '')}"
                </a>
                {i < external.length - 1 ? ',' : ''}
                {'\n'}
              </span>
            ))}
            {'}'}
            {'\n'}
            <span className={styles.prompt}>$ </span>
            <span className="cursor" />
          </pre>
        </div>
      </div>
      <p className={styles.colophon}>
        © {new Date().getFullYear()} {profile.name} · built with React Three Fiber
      </p>
    </Section>
  );
}

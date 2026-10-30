import { formatMonth } from '../utils/format';
import styles from './ItemCard.module.css';

interface Props {
  href: string;
  title: string;
  summary: string;
  date: string;
  context?: string;
  tags: string[];
  tech: string[];
  featured?: boolean;
  /** Heading level for the title, to keep the document outline correct. */
  headingLevel?: 'h3' | 'h4';
}

/** Card used for projects and research projects. The whole card is one link to the detail modal. */
export function ItemCard({
  href,
  title,
  summary,
  date,
  context,
  tags,
  tech,
  featured,
  headingLevel: Heading = 'h3',
}: Props) {
  return (
    <article className={`panel ${styles.card} ${featured ? styles.featured : ''}`}>
      <p className={styles.meta}>
        <span>{[context, formatMonth(date)].filter(Boolean).join(' · ')}</span>
        {featured && <span className={styles.badge}>★ featured</span>}
      </p>
      <Heading className={styles.title}>
        <a href={href} className={styles.link}>
          {title}
        </a>
      </Heading>
      <p className={styles.summary}>{summary}</p>
      <ul className={styles.tags} aria-label="Tags">
        {tags.map((t) => (
          <li key={t} className={styles.tag}>
            #{t}
          </li>
        ))}
      </ul>
      <ul className={styles.tech} aria-label="Tech stack">
        {tech.slice(0, 5).map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
        {tech.length > 5 && <li className="chip">+{tech.length - 5}</li>}
      </ul>
      <span className={styles.open} aria-hidden="true">
        open →
      </span>
    </article>
  );
}

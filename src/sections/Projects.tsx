import { useId, useMemo } from 'react';
import { ItemCard } from '../components/ItemCard';
import { Section } from '../components/Section';
import { projectTags, sortedProjects } from '../data';
import { useStore } from '../state/store';
import styles from './Projects.module.css';

export function Projects() {
  const tag = useStore((s) => s.projectTag);
  const search = useStore((s) => s.projectSearch);
  const setFilter = useStore((s) => s.setProjectFilter);
  const searchId = useId();

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    sortedProjects.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedProjects.filter(
      (p) =>
        (!tag || p.tags.includes(tag)) &&
        (!q ||
          [p.title, p.summary, p.description, p.context ?? '', ...p.tech, ...p.tags].some((f) =>
            f.toLowerCase().includes(q),
          )),
    );
  }, [tag, search]);

  return (
    <Section id="projects" index="02" title="projects" command="ls -la ~/projects">
      <div className={styles.controls}>
        <div className={styles.filters} role="group" aria-label="Filter projects by tag">
          <button
            type="button"
            className={styles.filter}
            aria-pressed={tag === null}
            onClick={() => setFilter({ tag: null })}
          >
            all <span className={styles.count}>{sortedProjects.length}</span>
          </button>
          {projectTags.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.filter}
              aria-pressed={tag === t}
              onClick={() => setFilter({ tag: tag === t ? null : t })}
            >
              #{t} <span className={styles.count}>{counts.get(t)}</span>
            </button>
          ))}
        </div>
        <div className={styles.search}>
          <label htmlFor={searchId} className={styles.searchLabel}>
            grep
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            placeholder="search projects…"
            onChange={(e) => setFilter({ search: e.target.value })}
            className={styles.searchInput}
          />
        </div>
      </div>

      <p className={styles.status} aria-live="polite">
        {filtered.length} result{filtered.length === 1 ? '' : 's'}
        {tag ? ` in #${tag}` : ''}
        {search ? ` for "${search}"` : ''}
      </p>

      {filtered.length > 0 ? (
        <ul className={styles.grid}>
          {filtered.map((p) => (
            <li key={p.id}>
              <ItemCard
                href={`#/projects/${p.id}`}
                title={p.title}
                summary={p.summary}
                date={p.date}
                context={p.context}
                tags={p.tags}
                tech={p.tech}
                featured={p.featured}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={`panel ${styles.empty}`}>
          <p>
            <span className={styles.err}>grep:</span> no projects match.
          </p>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setFilter({ tag: null, search: '' })}
          >
            reset filters
          </button>
        </div>
      )}
    </Section>
  );
}

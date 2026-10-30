import { useMemo } from 'react';
import { Section } from '../components/Section';
import { projects, researchProjects, stackLayers } from '../data';
import { navigateTo, useStore } from '../state/store';
import styles from './Stack.module.css';

interface Usage {
  projects: string[];
  research: string[];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Where each stack item appears, matching whole words in project / research `tech` lists. */
function usageFor(name: string): Usage {
  const re = new RegExp(`(^|[^\\w])${escape(name)}($|[^\\w])`, 'i');
  const uses = (tech: string[]) => tech.some((t) => re.test(t));
  return {
    projects: projects.filter((p) => uses(p.tech)).map((p) => p.title),
    research: researchProjects.filter((p) => uses(p.tech)).map((p) => p.title),
  };
}

export function Stack() {
  const setFilter = useStore((s) => s.setProjectFilter);
  const usage = useMemo(
    () => new Map(stackLayers.flatMap((l) => l.items.map((i) => [i, usageFor(i)] as const))),
    [],
  );
  const total = new Set(stackLayers.flatMap((l) => l.items)).size;

  const open = (name: string, u: Usage) => {
    if (u.projects.length > 0) {
      setFilter({ tag: null, search: name });
      navigateTo('projects');
    } else if (u.research.length > 0) {
      navigateTo('lab');
    }
  };

  return (
    <Section id="stack" index="07" title="tech stack" command="cat stack.yml">
      <p className={styles.lede}>
        {total} technologies across {stackLayers.length} layers, from the UI down to the
        infrastructure. The number on a chip is how many of my projects use it; click it to see
        them.
      </p>
      <ol className={styles.layers}>
        {stackLayers.map((layer, i) => (
          <li key={layer.id} className={`panel ${styles.layer}`}>
            <div className={styles.head}>
              <span className={styles.level} aria-hidden="true">
                L{stackLayers.length - i}
              </span>
              <h3 className={styles.title}>{layer.title}</h3>
              <p className={styles.blurb}>{layer.blurb}</p>
            </div>
            <ul className={styles.items} aria-label={`${layer.title} technologies`}>
              {layer.items.map((name) => {
                const u = usage.get(name) ?? { projects: [], research: [] };
                const count = u.projects.length + u.research.length;
                const where = [...u.projects, ...u.research].join(', ');
                return (
                  <li key={name}>
                    {count > 0 ? (
                      <button
                        type="button"
                        className={styles.item}
                        title={`Used in: ${where}`}
                        aria-label={`${name}, used in ${count} project${count === 1 ? '' : 's'}: ${where}`}
                        onClick={() => open(name, u)}
                      >
                        {name}
                        <span className={styles.count} aria-hidden="true">
                          {count}
                        </span>
                      </button>
                    ) : (
                      <span className={styles.item}>{name}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

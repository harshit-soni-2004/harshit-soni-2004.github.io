import { ItemCard } from '../components/ItemCard';
import { Section } from '../components/Section';
import { researchProjects } from '../data';
import styles from './Research.module.css';

export function Lab() {
  const sorted = [...researchProjects].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Section id="lab" index="03" title="research projects" command="ls ~/lab">
      <p className={styles.lede}>
        Research I worked on at DJ Sanghvi College of Engineering: sign-language translation,
        Hindi medical NLP and deepfake detection. Open a card for the architecture, results and a
        link to the <a href="#/research">paper</a>.
      </p>
      {sorted.length > 0 ? (
        <ul className={styles.grid}>
          {sorted.map((p) => (
            <li key={p.id}>
              <ItemCard
                href={`#/lab/${p.id}`}
                title={p.title}
                summary={p.summary}
                date={p.date}
                context={p.status}
                tags={p.tags}
                tech={p.tech}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No research projects yet.</p>
      )}
    </Section>
  );
}

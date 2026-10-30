import { useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { Section } from '../components/Section';
import { asset } from '../config/site';
import { papers, profile } from '../data';
import type { Paper } from '../data/types';
import styles from './Research.module.css';

function PaperItem({ paper }: { paper: Paper }) {
  const [open, setOpen] = useState(false);
  const abstractId = `abstract-${paper.id}`;
  const links = [
    { label: 'IEEE Xplore', href: paper.url },
    { label: 'DOI', href: paper.doi ? `https://doi.org/${paper.doi}` : undefined },
    { label: 'PDF', href: paper.pdf ? asset(paper.pdf) : undefined },
    { label: 'arXiv', href: paper.arxiv ? `https://arxiv.org/abs/${paper.arxiv}` : undefined },
  ].filter((l): l is { label: string; href: string } => !!l.href);

  return (
    <li className={`panel ${styles.paper} ${paper.image ? styles.withThumb : ''}`}>
      <div className={styles.body}>
        <p className={styles.venue}>
          <span>
            {paper.venue} · {paper.year}
            {paper.pages ? ` · pp. ${paper.pages}` : ''}
          </span>
          {paper.status && <span className={styles.status}>{paper.status}</span>}
        </p>
        <h3 className={styles.paperTitle}>
          <a href={`#/research/${paper.id}`}>{paper.title}</a>
        </h3>
        <p className={styles.authors}>
          {paper.authors.map((a, i) => (
            <span key={a + i}>
              {a === profile.name ? <strong>{a}</strong> : a}
              {i < paper.authors.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            aria-expanded={open}
            aria-controls={abstractId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '− abstract' : '+ abstract'}
          </button>
          {links.map((l) => (
            <a key={l.label} className="btn btn--sm" href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
          {paper.bibtex && <CopyButton text={paper.bibtex} label="Copy BibTeX" />}
        </div>
        <p id={abstractId} className={styles.abstract} hidden={!open}>
          {paper.abstract}
        </p>
      </div>
      {paper.image && (
        <a className={styles.thumb} href={`#/research/${paper.id}`} tabIndex={-1} aria-hidden="true">
          <img src={asset(paper.image)} alt="" loading="lazy" />
        </a>
      )}
    </li>
  );
}

export function Research() {
  const published = papers.filter((p) => p.doi).length;
  return (
    <Section id="research" index="04" title="papers" command="find ~/research -name '*.pdf'">
      <p className={styles.lede}>
        {papers.length} paper{papers.length === 1 ? '' : 's'}, {published} published with IEEE.
        Open one for the full abstract, a screenshot and BibTeX. The engineering behind each paper
        is under <a href="#/lab">research projects</a>.
      </p>
      {papers.length > 0 ? (
        <ol className={styles.papers}>
          {papers.map((p) => (
            <PaperItem key={p.id} paper={p} />
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No papers yet.</p>
      )}
    </Section>
  );
}

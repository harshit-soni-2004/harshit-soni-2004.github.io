import { useCallback } from 'react';
import { asset } from '../config/site';
import { papers, profile, projects, researchProjects } from '../data';
import type { Paper, Project, ResearchProject } from '../data/types';
import { navigateTo, useStore } from '../state/store';
import { formatMonth } from '../utils/format';
import { CopyButton } from './CopyButton';
import { Modal } from './Modal';
import styles from './DetailModal.module.css';

function LinkRow({ links }: { links: { label: string; href?: string }[] }) {
  const present = links.filter((l): l is { label: string; href: string } => !!l.href);
  if (present.length === 0) return null;
  return (
    <div className={styles.links}>
      {present.map((l) => (
        <a
          key={l.label}
          className="btn btn--sm"
          href={asset(l.href)}
          target="_blank"
          rel="noreferrer"
        >
          {l.label} ↗
        </a>
      ))}
    </div>
  );
}

function Chips({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul className={styles.chips} aria-label={label}>
      {items.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  );
}

function ProjectBody({ p }: { p: Project }) {
  return (
    <>
      <p className={styles.meta}>
        {[p.context, formatMonth(p.date), p.featured ? '★ featured' : null]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {p.image && (
        <img className={styles.media} src={asset(p.image)} alt={p.imageAlt ?? ''} loading="lazy" />
      )}
      {p.video && (
        <video
          className={styles.media}
          src={asset(p.video)}
          controls
          preload="metadata"
          playsInline
          aria-label={`${p.title} demo video`}
        />
      )}
      <p className={styles.description}>{p.description}</p>
      {p.highlights.length > 0 && (
        <>
          <h3 className={styles.h3}>## highlights</h3>
          <ul className={styles.list}>
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
      <h3 className={styles.h3}>## stack</h3>
      <Chips items={p.tech} label="Tech stack" />
      <LinkRow
        links={[
          { label: 'GitHub', href: p.github },
          { label: 'Live demo', href: p.demo },
        ]}
      />
    </>
  );
}

function PaperBody({ p }: { p: Paper }) {
  return (
    <>
      <p className={styles.meta}>
        {p.venue} · {p.year}
        {p.status ? ` · ${p.status}` : ''}
      </p>
      <p className={styles.authors}>
        {p.authors.map((a, i) => (
          <span key={a + i}>
            {a === profile.name ? <strong>{a}</strong> : a}
            {i < p.authors.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
      {p.image && (
        <img className={styles.media} src={asset(p.image)} alt={p.imageAlt ?? ''} loading="lazy" />
      )}
      <h3 className={styles.h3}>## abstract</h3>
      <p className={styles.description}>{p.abstract}</p>
      <Chips items={p.tags} label="Tags" />
      <LinkRow
        links={[
          { label: 'IEEE Xplore', href: p.url },
          { label: 'PDF', href: p.pdf },
          { label: 'DOI', href: p.doi ? `https://doi.org/${p.doi}` : undefined },
          { label: 'arXiv', href: p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : undefined },
        ]}
      />
      {p.bibtex && (
        <>
          <h3 className={styles.h3}>## bibtex</h3>
          <pre className={styles.code}>{p.bibtex}</pre>
          <CopyButton text={p.bibtex} label="Copy BibTeX" />
        </>
      )}
    </>
  );
}

function ResearchProjectBody({ p }: { p: ResearchProject }) {
  const paper = p.paper ? papers.find((x) => x.id === p.paper) : undefined;
  return (
    <>
      <p className={styles.meta}>
        {[p.affiliation, formatMonth(p.date), p.status].filter(Boolean).join(' · ')}
      </p>
      {p.image && (
        <img className={styles.media} src={asset(p.image)} alt={p.imageAlt ?? ''} loading="lazy" />
      )}
      <p className={styles.description}>{p.description}</p>
      {p.highlights.length > 0 && (
        <>
          <h3 className={styles.h3}>## highlights</h3>
          <ul className={styles.list}>
            {p.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
      <Chips items={p.tech} label="Tech stack" />
      <LinkRow
        links={[
          { label: 'IEEE Xplore', href: paper?.url },
          { label: 'GitHub', href: p.github },
          { label: 'Demo', href: p.demo },
          { label: 'PDF', href: p.pdf },
        ]}
      />
      {paper && (
        <p className={styles.meta}>
          Paper: <a href={`#/research/${paper.id}`}>{paper.title}</a> ({paper.year})
        </p>
      )}
    </>
  );
}

/** Renders the modal for the current deep link (#/projects/<id>, #/lab/<id> or #/research/<id>). */
export function DetailModal() {
  const route = useStore((s) => s.route);
  const section = route.section;
  const close = useCallback(() => {
    if (section) navigateTo(section);
  }, [section]);

  if (!route.id || (section !== 'projects' && section !== 'research' && section !== 'lab')) {
    return null;
  }

  if (section === 'projects') {
    const p = projects.find((x) => x.id === route.id);
    if (p) {
      return (
        <Modal title={p.title} onClose={close} eyebrow={`$ cat projects/${p.id}.md`}>
          <ProjectBody p={p} />
        </Modal>
      );
    }
  } else if (section === 'research') {
    const paper = papers.find((x) => x.id === route.id);
    if (paper) {
      return (
        <Modal title={paper.title} onClose={close} eyebrow={`$ cat research/papers/${paper.id}.md`}>
          <PaperBody p={paper} />
        </Modal>
      );
    }
  } else {
    const rp = researchProjects.find((x) => x.id === route.id);
    if (rp) {
      return (
        <Modal title={rp.title} onClose={close} eyebrow={`$ cat lab/${rp.id}.md`}>
          <ResearchProjectBody p={rp} />
        </Modal>
      );
    }
  }

  return (
    <Modal title="404: not found" onClose={close} eyebrow={`$ cat ${section}/${route.id}`}>
      <p className={styles.description}>
        No entry with id <code>{route.id}</code>. It may have been renamed.
      </p>
    </Modal>
  );
}

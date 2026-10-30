import { GlitchText } from '../components/GlitchText';
import { Typewriter } from '../components/Typewriter';
import { asset } from '../config/site';
import { profile } from '../data';
import styles from './Hero.module.css';

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section id="home" className={styles.hero} aria-labelledby="home-heading">
      <div className={styles.card} data-panel-body data-occluder>
        <p className={styles.whoami} aria-hidden="true">
          <span className={styles.dollar}>$</span> whoami
        </p>
        <h1 id="home-heading" className={styles.name} tabIndex={-1}>
          <GlitchText text={profile.name} />
        </h1>
        <p className={styles.titles}>
          <span className={styles.arrow} aria-hidden="true">
            &gt;
          </span>{' '}
          <Typewriter words={profile.titles} reducedMotion={reducedMotion} />
        </p>
        <p className={styles.tagline}>{profile.tagline}</p>
        <div className={styles.ctas}>
          <a className="btn" href="#/projects">
            ./view-projects
          </a>
          <a className="btn" href="#/lab">
            ./view-research-projects
          </a>
          <a className="btn btn--magenta" href={asset(profile.resumePath)} download>
            ↓ download-resume
          </a>
          <a className="btn btn--ghost" href="#/contact">
            ./contact
          </a>
        </div>
        <p className={styles.hint}>
          tip: press <kbd>/</kbd> for the terminal, <kbd>Ctrl K</kbd> to search, <kbd>←</kbd>
          <kbd>→</kbd> to switch panels.
        </p>
      </div>
    </section>
  );
}

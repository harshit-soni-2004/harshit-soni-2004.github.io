import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Background } from './components/Background';
import { BOOT_SESSION_KEY, BootSequence } from './components/BootSequence';
import { CommandBar } from './components/CommandBar';
import { DetailModal } from './components/DetailModal';
import { Scanlines } from './components/Scanlines';
import { StatusBar } from './components/StatusBar';
import { applyPalette, bootConfig, sectionPresets } from './config/theme';
import { useHashRoute } from './hooks/useHashRoute';
import { useReducedMotion } from './hooks/useMediaQuery';
import { usePanelKeys, useSwipeNavigation } from './hooks/usePanelNavigation';
import { usePerformanceTier } from './hooks/usePerformanceTier';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { Experience } from './sections/Experience';
import { Hero } from './sections/Hero';
import { Lab } from './sections/Lab';
import { Projects } from './sections/Projects';
import { Research } from './sections/Research';
import { Skills } from './sections/Skills';
import { Stack } from './sections/Stack';
import { useStore } from './state/store';
import { bumpPulse } from './three/motion';
import { SECTION_IDS, type SectionId } from './terminal/types';
import styles from './App.module.css';

const SpaceHud = lazy(() => import('./components/SpaceHud'));

function shouldShowBoot(): boolean {
  if (!bootConfig.enabled) return false;
  try {
    if (sessionStorage.getItem(BOOT_SESSION_KEY)) return false;
  } catch {
    return false;
  }
  // Skip the intro for deep links straight to a project or paper.
  return !/^#\/[a-z]+\/.+/.test(window.location.hash);
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();
  const effects = useStore((s) => s.effects);
  const palette = useStore((s) => s.palette);
  const section = useStore((s) => s.route.section) ?? 'home';
  const [booting, setBooting] = useState(shouldShowBoot);
  const endBoot = useCallback(() => setBooting(false), []);
  const swipe = useSwipeNavigation();

  useHashRoute();
  usePanelKeys();

  // Slide direction for the panel transition (+1 = from right, -1 = from left).
  const prevIndex = useRef(SECTION_IDS.indexOf(section));
  const index = SECTION_IDS.indexOf(section);
  const direction = index >= prevIndex.current ? 1 : -1;

  // On panel change: move focus to the new panel's heading (unless the user is typing in the
  // terminal or a dialog is open) and give the 3D scene a small kick.
  const firstRender = useRef(true);
  useEffect(() => {
    prevIndex.current = index;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    bumpPulse(0.6);
    const raf = requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active?.id === 'cmd-input' || document.querySelector('[aria-modal="true"]')) return;
      document.getElementById(`${section}-heading`)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [section, index]);

  // Reflect effect toggles as classes on <html> so plain CSS can react to them.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', reducedMotion);
    root.classList.toggle('fx-glitch-off', !effects.glitch || reducedMotion);
  }, [effects.glitch, reducedMotion]);

  useEffect(() => applyPalette(palette), [palette]);

  // Playground: faded panels are inert so keyboard and screen-reader users skip them.
  const playground = useStore((s) => s.playground);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.toggleAttribute('inert', playground);
  }, [playground]);

  // Dim the background more behind text-heavy panels.
  useEffect(() => {
    document.documentElement.style.setProperty('--scene-dim', String(sectionPresets[section].dim));
  }, [section]);

  const panels: Record<SectionId, ReactNode> = {
    home: <Hero reducedMotion={reducedMotion} />,
    about: <About />,
    projects: <Projects />,
    lab: <Lab />,
    research: <Research />,
    experience: <Experience />,
    skills: <Skills reducedMotion={reducedMotion} />,
    stack: <Stack />,
    contact: <Contact />,
  };

  return (
    <div className={styles.app} data-playground={playground || undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Background
        enabled={effects['3d']}
        bloom={effects.bloom}
        reducedMotion={reducedMotion}
        lowPower={tier === 'low'}
        paletteKey={palette}
      />
      <CommandBar active={section} />
      <main ref={mainRef} id="main" className={styles.stage} tabIndex={-1} {...swipe}>
        <div
          key={section}
          className={styles.panel}
          style={{ '--dir': direction } as React.CSSProperties}
        >
          {panels[section]}
        </div>
      </main>
      <StatusBar active={section} />
      <Suspense fallback={null}>
        <SpaceHud />
      </Suspense>
      <DetailModal />
      {effects.scanlines && <Scanlines />}
      {booting && <BootSequence reducedMotion={reducedMotion} onDone={endBoot} />}
    </div>
  );
}

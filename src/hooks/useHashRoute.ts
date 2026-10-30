import { useEffect } from 'react';
import { useStore, type Route } from '../state/store';
import { SECTION_IDS, type SectionId } from '../terminal/types';

/** '#/projects/spendsense' → { section: 'projects', id: 'spendsense' } */
export function parseHash(hash: string): Route {
  const [section, id] = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const valid = section && (SECTION_IDS as readonly string[]).includes(section);
  return {
    section: valid ? (section as SectionId) : null,
    id: valid && id ? decodeURIComponent(id) : null,
  };
}

/**
 * Lightweight hash router (works on GitHub Pages without server config). The hash decides which
 * panel is visible (`#/about`) and which detail modal is open (`#/projects/<id>`). Browser
 * back/forward simply replays hash changes.
 */
export function useHashRoute(): void {
  const setRoute = useStore((s) => s.setRoute);

  useEffect(() => {
    const apply = () => {
      // Ignore in-page anchors such as the skip link (#main).
      if (window.location.hash && !window.location.hash.startsWith('#/')) return;
      setRoute(parseHash(window.location.hash));
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, [setRoute]);
}

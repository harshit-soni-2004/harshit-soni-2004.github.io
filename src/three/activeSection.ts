import { useStore } from '../state/store';
import type { SectionId } from '../terminal/types';

/** Current panel, read inside useFrame without subscribing (no React re-renders). */
export function activeSection(): SectionId {
  return useStore.getState().route.section ?? 'home';
}

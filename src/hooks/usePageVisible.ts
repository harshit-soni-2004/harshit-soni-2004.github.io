import { useSyncExternalStore } from 'react';

/** `false` while the tab is hidden — used to stop the render loop. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.visibilityState !== 'hidden',
    () => true,
  );
}

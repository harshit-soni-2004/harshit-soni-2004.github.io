import { useMediaQuery } from './useMediaQuery';

export type PerformanceTier = 'high' | 'low';

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * Rough device classification for the 3D scene. "low" = phones/tablets, small screens,
 * few CPU cores, little memory, or Data Saver on. Low tier gets fewer grid segments,
 * no bloom and a 30fps cap.
 */
export function usePerformanceTier(): PerformanceTier {
  const coarse = useMediaQuery('(pointer: coarse)');
  const small = useMediaQuery('(max-width: 768px)');
  if (typeof navigator === 'undefined') return 'low';
  const nav = navigator as Navigator & NavigatorHints;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  return coarse || small || fewCores || lowMemory || saveData ? 'low' : 'high';
}

import { Color } from 'three';
import { sectionPresets } from '../config/theme';
import type { SectionId } from '../terminal/types';

export interface SceneColors {
  bg: Color;
  cyan: Color;
  magenta: Color;
  green: Color;
  /** Terrain tint per panel, resolved from sectionPresets. */
  tints: Record<SectionId, { a: Color; b: Color }>;
}

export function readCssColor(name: string, fallback = '#ffffff'): Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || fallback);
}

/** Read the palette from CSS variables so the 3D scene follows variables.css / theme changes. */
export function readThemeColors(): SceneColors {
  const tints = Object.fromEntries(
    Object.entries(sectionPresets).map(([id, p]) => [
      id,
      { a: readCssColor(p.tintA), b: readCssColor(p.tintB) },
    ]),
  ) as SceneColors['tints'];
  return {
    bg: readCssColor('--color-bg', '#05070a'),
    cyan: readCssColor('--neon-cyan', '#00f0ff'),
    magenta: readCssColor('--neon-magenta', '#ff2bd6'),
    green: readCssColor('--neon-green', '#39ff14'),
    tints,
  };
}

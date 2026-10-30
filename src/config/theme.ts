/**
 * Visual configuration.
 *
 * - Default colours live in src/styles/variables.css (single source of truth).
 * - `palettes` are optional overrides selectable at runtime (`theme <name>` or the FX menu).
 * - `effectDefaults` sets what is on for first-time visitors; users' choices persist in localStorage.
 */
import type { EffectName, PointerMode, SectionId, SpaceKind } from '../terminal/types';

/** CSS variables a palette may override. */
export type ColorVar =
  | '--color-bg'
  | '--color-surface'
  | '--color-surface-2'
  | '--color-border'
  | '--neon-cyan'
  | '--neon-magenta'
  | '--neon-green';

export const DEFAULT_PALETTE = 'cyberpunk';

export const palettes: Record<string, Partial<Record<ColorVar, string>>> = {
  /** Uses the values from variables.css as-is. */
  cyberpunk: {},
  matrix: {
    '--neon-cyan': '#39ff14',
    '--neon-magenta': '#00c853',
    '--neon-green': '#b6ff9e',
  },
  synthwave: {
    '--neon-cyan': '#ff9e00',
    '--neon-magenta': '#ff2bd6',
    '--neon-green': '#ffe066',
    '--color-bg': '#0a0612',
  },
  ice: {
    '--neon-cyan': '#7df9ff',
    '--neon-magenta': '#8a7dff',
    '--neon-green': '#c4f1ff',
  },
};

export const effectDefaults: Record<EffectName, boolean> = {
  scanlines: true,
  glitch: true,
  bloom: true,
  '3d': true,
};

export const bootConfig = {
  enabled: true,
  /** Approximate total duration of the boot log in ms. */
  durationMs: 2000,
};

/** 3D background quality presets, picked by usePerformanceTier(). */
export const sceneQuality = {
  high: { segments: 140, particles: 700, fps: 60, maxDpr: 2, shapes: 6, sun: true },
  low: { segments: 56, particles: 180, fps: 30, maxDpr: 1.25, shapes: 3, sun: true },
} as const;

/**
 * How the 3D background reacts to the mouse (terrain lift, camera parallax, space-object repel).
 * Always off on touch devices and with prefers-reduced-motion. Visitors switch presets live with
 * `fx calm|intense|off`; `calm` (this object) is the default.
 */
export interface PointerInteraction {
  /** Master switch for every pointer-driven effect. */
  enabled: boolean;
  /** Peak vertex lift near the cursor, in world units. */
  amplitude: number;
  /** Influence radius around the cursor (gaussian falloff), in world units. */
  radius: number;
  /**
   * Per-frame lerp factor of the smoothed pointer towards the real one (at 60fps).
   * Lower = slower and smoother; 1 = follow the raw pointer exactly.
   */
  smoothing: number;
  /**
   * Per-frame fade of the raised area (at 60fps) once the pointer is idle or leaves the window.
   * 0.92 settles in ~1s; closer to 1 lingers longer. Also sets how fast trail ripples fade.
   */
  decay: number;
  /** Camera / grid tilt from mouse position. 0 = none. */
  parallaxStrength: number;
  /**
   * Speed cap for the smoothed pointer, in viewport-widths per second. Flicking the mouse faster
   * than this adds nothing, so waves can't spike.
   */
  maxSpeedInfluence: number;
  /** Number of past pointer positions that leave a ripple trail (max 20). */
  trailLength: number;
  /** Emit an expanding ring wave on click. */
  clickWave: boolean;
  /** Ring-wave height relative to `terrainShape.wave.amplitude`. */
  clickWaveStrength: number;
  /** Ignore pointer movements smaller than this many CSS pixels per frame. */
  deadZonePx: number;
  /** Seconds without movement before the effect starts fading out. */
  idleDelay: number;
  /** Multiplier for amplitude and parallax while the pointer is over a text-heavy panel. */
  panelDamping: number;
}

export const pointerInteraction: PointerInteraction = {
  enabled: true,
  amplitude: 0.35,
  radius: 2.5,
  smoothing: 0.04,
  decay: 0.92,
  parallaxStrength: 0.15,
  maxSpeedInfluence: 0.5,
  trailLength: 8,
  clickWave: true,
  clickWaveStrength: 0.5,
  deadZonePx: 2,
  idleDelay: 0.4,
  panelDamping: 0.4,
};

/** The original, livelier tuning (`fx intense`). */
export const pointerInteractionIntense: PointerInteraction = {
  ...pointerInteraction,
  amplitude: 0.9,
  radius: 3,
  smoothing: 0.21,
  decay: 0.926,
  parallaxStrength: 0.45,
  maxSpeedInfluence: 4,
  trailLength: 20,
  clickWaveStrength: 1,
  deadZonePx: 0,
  idleDelay: 1.5,
  panelDamping: 1,
};

export const pointerPresets: Record<Exclude<PointerMode, 'off'>, PointerInteraction> = {
  calm: pointerInteraction,
  intense: pointerInteractionIntense,
};
export const DEFAULT_POINTER_MODE: PointerMode = 'calm';

/** Panels whose text should keep the background calm (amplitude/parallax × panelDamping). */
export const calmPanels: SectionId[] = ['about', 'experience', 'projects', 'research'];

/** Shape of the terrain's pointer effect (sensitivity lives in `pointerInteraction`). */
export const terrainShape = {
  /** Size of the trail array compiled into the shader (upper bound for `trailLength`). */
  maxTrail: 20,
  /** Minimum ms between trail samples (throttles history updates). */
  trailInterval: 40,
  /** Minimum distance (world units) the pointer must travel before a new trail sample. */
  trailSpacing: 0.35,
  /** Extra line brightness at the centre of the influence (1 = double). */
  glow: 1.4,
  /** Click shockwave: expanding ring that fades out. */
  wave: { amplitude: 0.7, speed: 9, width: 0.9, life: 1.8, max: 4 },
} as const;

/** Interactive objects floating in the background (entries live in src/data/spaceObjects.ts). */
export const spaceObjects = {
  /** Global multiplier for every object's drift speed. */
  driftSpeed: 1,
  /** How far objects wander from their start position (fraction of the half-view). */
  driftAmplitude: 0.22,
  /** Velocity damping per second after a throw or kick (higher = stops sooner). */
  throwDamping: 0.9,
  /** Spin damping per second after a drag-rotate (higher = stops sooner). */
  spinDamping: 1.6,
  /** Seconds after a throw/kick before an object eases back to its drift path. */
  returnDelay: 3.5,
  /** Spring stiffness pulling objects back to their drift path. */
  returnStiffness: 2.2,
  /** Pointer repel field radius (view units at the object's depth) and push strength. */
  repelRadius: 2.2,
  repelStrength: 5,
  /** Hard cap on objects alive at once (defaults + `spawn`). */
  maxObjects: 10,
  /** Initial speed of a kicked football (view units / s) and its spin (rad / s). */
  kickStrength: 9,
  kickSpin: 9,
  /** `launch`: boost speed and duration for the ships. */
  launchSpeed: 14,
  launchSeconds: 2.4,
  /** Wall bounce restitution (0 = dead stop, 1 = perfectly elastic). */
  restitution: 0.7,
  /** Playground mode: objects move this much closer (fraction of depth) and scale up. */
  playgroundCloser: 0.35,
  playgroundScale: 1.15,
  /** Trail particle pool size (shared by all objects). */
  maxParticles: 260,
  /** Low-power / mobile: object scale and which kinds to keep (first of each kind). */
  lowPower: { scale: 0.8, kinds: ['ball', 'saucer'] as SpaceKind[] },
} as const;

/** CSS colour variables the 3D scene can be tinted with. */
export type TintVar = '--neon-cyan' | '--neon-magenta' | '--neon-green' | '--neon-warning';

/**
 * Per-panel 3D framing. When a panel opens, the camera lerps to `camera` and looks at `lookAt`,
 * the terrain tint blends to `tintA` (low ground) / `tintB` (ridges), and the background is
 * dimmed by `dim` (0 = none, 1 = black) so text-heavy panels stay readable.
 */
export interface SectionPreset {
  camera: [number, number, number];
  lookAt: [number, number, number];
  tintA: TintVar;
  tintB: TintVar;
  dim: number;
}

export const sectionPresets: Record<SectionId, SectionPreset> = {
  home: {
    camera: [0, 1.6, 8],
    lookAt: [0, -0.5, -10],
    tintA: '--neon-cyan',
    tintB: '--neon-magenta',
    dim: 0.25,
  },
  about: {
    camera: [-3.5, 2.2, 6],
    lookAt: [-6, 1.5, -6],
    tintA: '--neon-magenta',
    tintB: '--neon-cyan',
    dim: 0.5,
  },
  projects: {
    camera: [3.5, 1.4, 6],
    lookAt: [7, 1.2, -8],
    tintA: '--neon-cyan',
    tintB: '--neon-green',
    dim: 0.5,
  },
  lab: {
    camera: [1.5, 3, 5.5],
    lookAt: [4, 3.5, -10],
    tintA: '--neon-magenta',
    tintB: '--neon-green',
    dim: 0.5,
  },
  research: {
    camera: [0, 4.2, 5],
    lookAt: [0, 5, -12],
    tintA: '--neon-green',
    tintB: '--neon-cyan',
    dim: 0.55,
  },
  experience: {
    camera: [-2.5, 0.8, 7],
    lookAt: [-8, 0.5, -14],
    tintA: '--neon-magenta',
    tintB: '--neon-warning',
    dim: 0.6,
  },
  skills: {
    camera: [2.5, 2.8, 4.5],
    lookAt: [8, 3, -14],
    tintA: '--neon-green',
    tintB: '--neon-magenta',
    dim: 0.45,
  },
  stack: {
    camera: [-1.5, 3.4, 5],
    lookAt: [-5, 4, -12],
    tintA: '--neon-cyan',
    tintB: '--neon-warning',
    dim: 0.5,
  },
  contact: {
    camera: [0, 0.6, 9],
    lookAt: [0, 2, -30],
    tintA: '--neon-cyan',
    tintB: '--neon-magenta',
    dim: 0.35,
  },
};

/** Apply a palette by setting CSS variables on <html>. Unknown names fall back to the default. */
export function applyPalette(name: string): void {
  const root = document.documentElement;
  const all = new Set<ColorVar>(
    Object.values(palettes).flatMap((p) => Object.keys(p) as ColorVar[]),
  );
  all.forEach((v) => root.style.removeProperty(v));
  const overrides = palettes[name] ?? {};
  (Object.entries(overrides) as [ColorVar, string][]).forEach(([k, v]) =>
    root.style.setProperty(k, v),
  );
}

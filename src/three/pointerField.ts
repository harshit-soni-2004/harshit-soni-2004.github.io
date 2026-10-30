import { useFrame } from '@react-three/fiber';
import { pointerPresets, type PointerInteraction } from '../config/theme';
import { useStore } from '../state/store';
import { motion } from './motion';

/**
 * Smoothed pointer shared by the terrain, the camera parallax and the space objects.
 * Never drive effects from the raw pointer: this applies the dead zone, smoothing, speed cap,
 * idle fade and the calm-panel damping from `pointerInteraction`.
 */
export const pointerField = {
  /** Smoothed pointer in NDC (-1..1). */
  x: 0,
  y: 0,
  /** Effect strength 0..1: rises while the mouse moves, fades when idle or outside the window. */
  presence: 0,
  /** Smoothed pointer speed, normalised to 0..1 of `maxSpeedInfluence`. */
  speed: 0,
  /** 1 normally, eases to `panelDamping` over text-heavy panels. */
  damping: 1,
  /** False on touch devices, with reduced motion, `fx off` or `enabled: false`. */
  active: false,
  /** Preset in effect this frame. */
  config: pointerPresets.calm as PointerInteraction,
};

/** `clock` is monotonic: R3F resets clock.elapsedTime when the frameloop changes. */
const state = { targetX: 0, targetY: 0, lastX: NaN, lastY: NaN, lastMove: -Infinity, clock: 0 };

/** Per-frame factor `f` (defined at 60fps) converted to this frame's delta. */
const perFrame = (f: number, dt: number) => Math.pow(f, dt * 60);

/** Updates `pointerField` once per frame. Mount it first inside the Canvas. */
export function PointerFieldDriver({ allowed }: { allowed: boolean }) {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    state.clock += dt;
    const mode = useStore.getState().pointerMode;
    const cfg = mode === 'off' ? pointerPresets.calm : pointerPresets[mode];
    const f = pointerField;
    f.config = cfg;
    f.active = allowed && mode !== 'off' && cfg.enabled;
    const now = state.clock;

    if (f.active && motion.mouseInside) {
      // Dead zone: ignore sub-pixel jitter and tiny movements.
      const moved = Math.hypot(motion.clientX - state.lastX, motion.clientY - state.lastY);
      if (!(moved < cfg.deadZonePx)) {
        state.lastX = motion.clientX;
        state.lastY = motion.clientY;
        state.targetX = motion.pointerX;
        state.targetY = motion.pointerY;
        state.lastMove = now;
      }
    }

    // Lerp towards the target, with the step clamped to the speed cap (2 NDC = one viewport).
    const a = 1 - Math.pow(1 - Math.min(Math.max(cfg.smoothing, 0), 1), dt * 60);
    let sx = (state.targetX - f.x) * a;
    let sy = (state.targetY - f.y) * a;
    const step = Math.hypot(sx, sy);
    const maxStep = cfg.maxSpeedInfluence * 2 * dt;
    if (step > maxStep && step > 0) {
      sx *= maxStep / step;
      sy *= maxStep / step;
    }
    f.x += sx;
    f.y += sy;
    const speed = dt > 0 && maxStep > 0 ? Math.min(Math.hypot(sx, sy) / maxStep, 1) : 0;
    f.speed += (speed - f.speed) * (1 - perFrame(0.85, dt));

    const engaged = f.active && motion.mouseInside && now - state.lastMove < cfg.idleDelay;
    const fade = perFrame(cfg.decay, dt);
    f.presence = engaged ? f.presence + (1 - f.presence) * (1 - fade) : f.presence * fade;
    if (f.presence < 1e-3) f.presence = 0;

    const damp = motion.overCalm ? cfg.panelDamping : 1;
    f.damping += (damp - f.damping) * (1 - perFrame(0.9, dt));
  });
  return null;
}

/** Seconds for `decay` (per-frame at 60fps) to fade an effect to ~1%. */
export function decaySeconds(decay: number): number {
  const d = Math.min(Math.max(decay, 0.01), 0.999);
  return Math.log(0.01) / (Math.log(d) * 60);
}

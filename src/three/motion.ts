/**
 * Shared input state for the scene. Updated by passive window listeners (the canvas itself has
 * pointer-events: none so it never blocks the page), read inside useFrame without re-renders.
 * Kept free of three.js imports so UI code can call `bumpPulse()` without pulling in the 3D chunk.
 */
export const motion = {
  /** Raw pointer position in -1..1 (x right, y up). Use `pointerField` for smoothed values. */
  pointerX: 0,
  pointerY: 0,
  /** Raw pointer position in CSS pixels. */
  clientX: 0,
  clientY: 0,
  /** True while a mouse is over the window (touch and pen never set this). */
  mouseInside: false,
  /** True while the pointer is over a text-heavy panel (`data-calm-zone`). */
  overCalm: false,
  /** Short-lived energy (0..1+) from typing / panel switches; decays every frame. */
  pulse: 0,
  /** Pending mouse clicks (NDC) for terrain shockwaves; drained by the terrain each frame. */
  clicks: [] as Array<{ x: number; y: number }>,
};

const MAX_PENDING_CLICKS = 4;

/** Give the scene a small kick (terrain speeds up and brightens briefly). */
export function bumpPulse(amount = 0.35): void {
  motion.pulse = Math.min(2, motion.pulse + amount);
}

export function attachMotionListeners(): () => void {
  const toNdc = (e: PointerEvent) => ({
    x: (e.clientX / window.innerWidth) * 2 - 1,
    y: -((e.clientY / window.innerHeight) * 2 - 1),
  });
  const onMove = (e: PointerEvent) => {
    const p = toNdc(e);
    motion.pointerX = p.x;
    motion.pointerY = p.y;
    motion.clientX = e.clientX;
    motion.clientY = e.clientY;
    motion.mouseInside = e.pointerType === 'mouse';
    motion.overCalm = !!(e.target as Element | null)?.closest?.('[data-calm-zone]');
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    motion.clicks.push(toNdc(e));
    if (motion.clicks.length > MAX_PENDING_CLICKS) motion.clicks.shift();
  };
  const onLeave = () => {
    motion.mouseInside = false;
  };
  const root = document.documentElement;
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  root.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    root.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
  };
}

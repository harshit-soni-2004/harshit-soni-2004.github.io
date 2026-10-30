/**
 * Tiny integrator for the floating objects: position, velocity, spin, damping and soft bounds.
 * Pure (no three.js) so it is unit-tested; all coordinates are view space (camera-relative).
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Body {
  pos: Vec3;
  vel: Vec3;
  /** Angular velocity (rad/s) around the view x / y / z axes. */
  spin: Vec3;
  /** Being dragged: the integrator leaves position to the pointer. */
  held: boolean;
  /** Until this time (s) the body drifts freely (after a throw/kick) instead of returning home. */
  freeUntil: number;
  /** Launch mode: wrap around the left/right edges instead of bouncing. */
  wrap: boolean;
}

export interface StepOptions {
  dt: number;
  now: number;
  /** Point on the drift path the body springs back to (null = no spring). */
  home: Vec3 | null;
  /** Linear damping per second while free. */
  damping: number;
  /** Angular damping per second. */
  spinDamping: number;
  /** Spring stiffness towards `home` (critically damped). */
  stiffness: number;
  /** Bounce energy kept at the walls (0..1). */
  restitution: number;
  /** Half-extents of the box the body lives in (x/y at its depth; z as min/max depth). */
  bounds: { x: number; y: number; zNear: number; zFar: number };
}

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

export function createBody(pos: Vec3): Body {
  return { pos: { ...pos }, vel: vec3(), spin: vec3(), held: false, freeUntil: 0, wrap: false };
}

const AXES = ['x', 'y'] as const;

/** Advance one body by `dt` seconds. */
export function step(b: Body, o: StepOptions): void {
  const { dt } = o;
  if (dt <= 0) return;
  const spinKeep = Math.exp(-o.spinDamping * dt);
  b.spin.x *= spinKeep;
  b.spin.y *= spinKeep;
  b.spin.z *= spinKeep;
  if (b.held) return;

  const free = o.now < b.freeUntil || !o.home;
  if (free) {
    const keep = Math.exp(-o.damping * dt);
    b.vel.x *= keep;
    b.vel.y *= keep;
    b.vel.z *= keep;
  } else if (o.home) {
    // Critically damped spring: eases back onto the drift path without overshoot.
    const k = o.stiffness;
    const c = 2 * Math.sqrt(k);
    b.vel.x += (k * (o.home.x - b.pos.x) - c * b.vel.x) * dt;
    b.vel.y += (k * (o.home.y - b.pos.y) - c * b.vel.y) * dt;
    b.vel.z += (k * (o.home.z - b.pos.z) - c * b.vel.z) * dt;
  }

  b.pos.x += b.vel.x * dt;
  b.pos.y += b.vel.y * dt;
  b.pos.z += b.vel.z * dt;
  constrain(b, o);
}

/** Soft walls: clamp and reflect velocity (or wrap horizontally in launch mode). */
export function constrain(b: Body, o: Pick<StepOptions, 'bounds' | 'restitution'>): void {
  const { bounds, restitution } = o;
  for (const axis of AXES) {
    const limit = bounds[axis];
    if (axis === 'x' && b.wrap) {
      const margin = limit * 0.25;
      if (b.pos.x > limit + margin) b.pos.x = -limit - margin;
      else if (b.pos.x < -limit - margin) b.pos.x = limit + margin;
      continue;
    }
    if (b.pos[axis] > limit) {
      b.pos[axis] = limit;
      if (b.vel[axis] > 0) b.vel[axis] *= -restitution;
    } else if (b.pos[axis] < -limit) {
      b.pos[axis] = -limit;
      if (b.vel[axis] < 0) b.vel[axis] *= -restitution;
    }
  }
  // View space looks down -z: depth = -z.
  const depth = -b.pos.z;
  if (depth < bounds.zNear) {
    b.pos.z = -bounds.zNear;
    if (b.vel.z < 0) b.vel.z *= -restitution;
  } else if (depth > bounds.zFar) {
    b.pos.z = -bounds.zFar;
    if (b.vel.z > 0) b.vel.z *= -restitution;
  }
}

/** Push the body away from `point` (x/y at the body's depth) with a smooth falloff. */
export function repel(
  b: Body,
  point: { x: number; y: number },
  radius: number,
  strength: number,
  dt: number,
): void {
  if (b.held || radius <= 0) return;
  const dx = b.pos.x - point.x;
  const dy = b.pos.y - point.y;
  const d = Math.hypot(dx, dy);
  if (d >= radius || d < 1e-6) return;
  const falloff = (1 - d / radius) ** 2;
  b.vel.x += (dx / d) * strength * falloff * dt;
  b.vel.y += (dy / d) * strength * falloff * dt;
}

/** Give the body an impulse and let it drift freely for `freeFor` seconds. */
export function impulse(b: Body, vel: Vec3, spin: Vec3, now: number, freeFor: number): void {
  b.vel.x += vel.x;
  b.vel.y += vel.y;
  b.vel.z += vel.z;
  b.spin.x += spin.x;
  b.spin.y += spin.y;
  b.spin.z += spin.z;
  b.freeUntil = Math.max(b.freeUntil, now + freeFor);
}

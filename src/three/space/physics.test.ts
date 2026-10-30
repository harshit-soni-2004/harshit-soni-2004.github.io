import { describe, expect, it } from 'vitest';
import { createBody, impulse, repel, step, vec3, type StepOptions } from './physics';

const opts = (over: Partial<StepOptions> = {}): StepOptions => ({
  dt: 1 / 60,
  now: 0,
  home: null,
  damping: 1,
  spinDamping: 1,
  stiffness: 2,
  restitution: 0.5,
  bounds: { x: 10, y: 6, zNear: 4, zFar: 20 },
  ...over,
});

const run = (frames: number, fn: (i: number) => void) => {
  for (let i = 0; i < frames; i++) fn(i);
};

describe('space physics', () => {
  it('damps velocity and spin while drifting freely', () => {
    const b = createBody(vec3(0, 0, -10));
    impulse(b, vec3(5, 0, 0), vec3(0, 3, 0), 0, 10);
    run(60, (i) => step(b, opts({ now: i / 60 })));
    expect(b.vel.x).toBeGreaterThan(0);
    expect(b.vel.x).toBeLessThan(5 * Math.exp(-1) + 0.01);
    expect(b.spin.y).toBeLessThan(3 * Math.exp(-1) + 0.01);
    expect(b.pos.x).toBeGreaterThan(2);
  });

  it('bounces softly off the walls', () => {
    const b = createBody(vec3(9.9, 0, -10));
    impulse(b, vec3(20, 0, 0), vec3(), 0, 10);
    step(b, opts());
    expect(b.pos.x).toBe(10);
    expect(b.vel.x).toBeLessThan(0);
    expect(Math.abs(b.vel.x)).toBeLessThan(20 * 0.5 + 1e-9);
  });

  it('keeps depth inside the near/far range', () => {
    const b = createBody(vec3(0, 0, -5));
    impulse(b, vec3(0, 0, 200), vec3(), 0, 10);
    step(b, opts());
    expect(-b.pos.z).toBeGreaterThanOrEqual(4);
  });

  it('wraps horizontally in launch mode', () => {
    const b = createBody(vec3(12.4, 0, -10));
    b.wrap = true;
    impulse(b, vec3(10, 0, 0), vec3(), 0, 10);
    step(b, opts());
    expect(b.pos.x).toBeLessThan(0);
  });

  it('eases back to its drift path once the free time is over', () => {
    const b = createBody(vec3(5, 3, -10));
    const home = vec3(0, 0, -10);
    run(600, (i) => step(b, opts({ now: 1 + i / 60, home })));
    expect(Math.hypot(b.pos.x, b.pos.y)).toBeLessThan(0.05);
  });

  it('does not return home while still free after a kick', () => {
    const b = createBody(vec3(0, 0, -10));
    impulse(b, vec3(4, 0, 0), vec3(), 0, 5);
    run(60, (i) => step(b, opts({ now: i / 60, home: vec3(0, 0, -10) })));
    expect(b.pos.x).toBeGreaterThan(1);
  });

  it('repels away from the pointer, only inside the radius', () => {
    const b = createBody(vec3(1, 0, -10));
    repel(b, { x: 0, y: 0 }, 2, 10, 0.1);
    expect(b.vel.x).toBeGreaterThan(0);
    const far = createBody(vec3(5, 0, -10));
    repel(far, { x: 0, y: 0 }, 2, 10, 0.1);
    expect(far.vel.x).toBe(0);
  });

  it('leaves held bodies to the pointer', () => {
    const b = createBody(vec3(0, 0, -10));
    b.held = true;
    impulse(b, vec3(5, 0, 0), vec3(), 0, 10);
    step(b, opts());
    expect(b.pos.x).toBe(0);
  });
});

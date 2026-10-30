import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  type PerspectiveCamera,
  Quaternion,
  Ray,
  Vector2,
  Vector3,
  type Material,
} from 'three';
import { spaceObjects as tuning } from '../../config/theme';
import { spaceObjects as entries, type SpaceObjectEntry } from '../../data';
import { spaceInput, spaceQueue, useStore, type SpaceInstance } from '../../state/store';
import type { SpaceCommand, SpaceKind } from '../../terminal/types';
import type { SceneColors } from '../colors';
import { pointerField } from '../pointerField';
import {
  acquireAssets,
  colorFor,
  materialsFor,
  releaseAssets,
  retintAll,
  type ShipKind,
} from './assets';
import { createBody, impulse, repel, step, vec3, type Body, type Vec3 } from './physics';

interface Props {
  colors: SceneColors;
  animate: boolean;
  lowPower: boolean;
  playground: boolean;
}

type Swappable = { material: Material | Material[] };

/** Live state of one object (mutated every frame, never stored in React state). */
interface Obj {
  id: string;
  entry: SpaceObjectEntry;
  body: Body;
  start: Vec3;
  phase: number;
  quat: Quaternion;
  outer: Group | null;
  inner: Group | null;
  /** Meshes / lines whose material swaps to the highlighted variant on hover/focus. */
  parts: { object: Swappable; base: Material; hi: Material }[];
  pods: InstancedMesh | null;
  beam: Mesh | null;
  glow: Mesh | null;
  head: Group | null;
  lit: boolean;
  ringAngle: number;
  spinAt: number;
  rollAt: number;
  flashAt: number;
  fadeAt: number;
  launchUntil: number;
}

const POD_COUNT = 12;
const HIT_RADIUS = 0.85;
const CLICK_PX = 6;
const CLICK_MS = 350;
const DOUBLE_MS = 320;
const DOUBLE_PX = 24;
const BLOCKING =
  'a,button,input,textarea,select,label,summary,[role="button"],[role="dialog"],[contenteditable="true"],[data-occluder]';

/** Can the 3D layer take this pointer event? (Never steals clicks from links, text or panels.) */
function isExposed(target: EventTarget | null): boolean {
  const el = target as Element | null;
  if (!el?.closest) return true;
  if (el.closest('canvas')) return true;
  return !el.closest(BLOCKING);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const SHIP_KINDS: readonly SpaceKind[] = ['rocket', 'delorean', 'falcon', 'walle', 'milano'];
const isShip = (k: SpaceKind): k is ShipKind => SHIP_KINDS.includes(k);

/** Resting orientation per kind, chosen so each model's most recognisable side faces the camera. */
const TILT: Record<SpaceKind, [number, number, number]> = {
  station: [0.5, 0, 0],
  saucer: [0.4, 0.5, 0],
  ball: [0, 0, 0],
  rocket: [0.15, 0.4, 0.18],
  delorean: [0.3, -0.55, 0.05],
  falcon: [0.95, 0, 0.15],
  walle: [0.15, -0.5, 0],
  milano: [0.75, 0.2, -0.25],
};

/** Glow colour per ship: engine fire, flux capacitor blue, hyperdrive blue, eye lenses. */
const GLOW: Record<ShipKind, 'amber' | 'cyan' | 'green' | 'magenta'> = {
  rocket: 'amber',
  delorean: 'cyan',
  falcon: 'cyan',
  walle: 'amber',
  milano: 'magenta',
};
const IDLE_GLOW = 0.22;

function defaultEntries(lowPower: boolean): SpaceObjectEntry[] {
  const enabled = entries.filter((e) => e.enabled);
  if (!lowPower) return enabled.slice(0, tuning.maxObjects);
  return tuning.lowPower.kinds.flatMap((k) => enabled.find((e) => e.type === k) ?? []);
}

function makeObj(entry: SpaceObjectEntry, id: string, start: Vec3): Obj {
  return {
    id,
    entry,
    body: createBody(start),
    start,
    phase: Math.random() * Math.PI * 2,
    quat: new Quaternion().setFromEuler(new Euler(...TILT[entry.type])),
    outer: null,
    inner: null,
    parts: [],
    pods: null,
    beam: null,
    glow: null,
    head: null,
    lit: false,
    ringAngle: 0,
    spinAt: -99,
    rollAt: -99,
    flashAt: -99,
    fadeAt: -99,
    launchUntil: -99,
  };
}

/** Start position in view space from the entry's normalised [x, y, depth]. */
function startFor(entry: SpaceObjectEntry, tanHalf: number, aspect: number): Vec3 {
  const [nx, ny, depth] = entry.start;
  return vec3(nx * depth * tanHalf * aspect, ny * depth * tanHalf, -depth);
}

export default function SpaceObjects({ colors, animate, lowPower, playground }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const root = useRef<Group>(null);
  const assets = useMemo(() => acquireAssets(), []);
  useEffect(() => () => releaseAssets(), []);
  useEffect(() => retintAll(colors), [colors]);

  const objs = useRef<Obj[]>([]);
  const [list, setList] = useState<Obj[]>([]);
  const [labelId, setLabelId] = useState<string | null>(null);
  const trails = !lowPower && animate;

  const view = () => {
    const tanHalf = Math.tan(((camera.fov ?? 60) * Math.PI) / 360);
    return { tanHalf, aspect: size.width / Math.max(size.height, 1) };
  };

  const publish = (next: Obj[]) => {
    objs.current = next;
    setList(next);
    useStore.getState().setSpaceInstances(
      next.map<SpaceInstance>((o) => ({
        id: o.id,
        dataId: o.entry.id,
        type: o.entry.type,
        label: o.entry.label,
      })),
    );
  };

  const resetObjects = () => {
    const { tanHalf, aspect } = view();
    publish(defaultEntries(lowPower).map((e) => makeObj(e, e.id, startFor(e, tanHalf, aspect))));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(resetObjects, [lowPower]);
  useEffect(() => () => useStore.getState().setSpaceInstances([]), []);

  // Start positions are fractions of the view, so recompute them when the viewport changes.
  useEffect(() => {
    const { tanHalf, aspect } = view();
    objs.current.forEach((o) => (o.start = startFor(o.entry, tanHalf, aspect)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // ---------- particles (shared pool for kick trails and thrusters) ----------
  const particles = useMemo(() => {
    const n = tuning.maxParticles;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('color', new BufferAttribute(new Float32Array(n * 3), 3));
    return {
      n,
      geo,
      vel: new Float32Array(n * 3),
      life: new Float32Array(n),
      max: new Float32Array(n),
      base: new Float32Array(n * 3),
      next: 0,
    };
  }, []);
  useEffect(() => () => particles.geo.dispose(), [particles]);

  const emit = (p: Vec3, v: Vec3, c: Color, life: number) => {
    const i = particles.next;
    particles.next = (i + 1) % particles.n;
    const pos = particles.geo.attributes.position as BufferAttribute;
    pos.setXYZ(i, p.x, p.y, p.z);
    particles.vel.set([v.x, v.y, v.z], i * 3);
    particles.base.set([c.r, c.g, c.b], i * 3);
    particles.life[i] = life;
    particles.max[i] = life;
  };

  // ---------- reactions ----------
  const scratch = useMemo(
    () => ({
      v: new Vector3(),
      w: new Vector3(),
      ray: new Ray(),
      ndc: new Vector2(),
      m: new Matrix4(),
      q: new Quaternion(),
      axis: new Vector3(),
      c: new Color(),
    }),
    [],
  );

  const now = () => performance.now() / 1000;

  const interact = (o: Obj, from?: { x: number; y: number }) => {
    const t = now();
    if (!animate) {
      o.fadeAt = t;
      if (o.entry.type === 'ball') countKick();
      invalidate();
      return;
    }
    if (o.entry.type === 'station') {
      o.spinAt = t;
      o.flashAt = t;
    } else if (o.entry.type === 'ball') {
      kick(o, from);
    } else {
      o.rollAt = t;
      const say: Partial<Record<SpaceKind, string>> = {
        rocket: 'MAV main engine burn.',
        delorean: '88 miles per hour!',
        falcon: 'Punch it! Jumping to lightspeed.',
        walle: 'WALL-E looks around.',
        milano: 'Milano barrel roll.',
      };
      const msg = say[o.entry.type];
      if (msg) useStore.getState().announceSpace(msg);
    }
    invalidate();
  };

  const countKick = () => {
    const s = useStore.getState();
    s.addKick();
    s.announceSpace(`Kick! kicks: ${s.kicks + 1}`);
  };

  const kick = (o: Obj, from?: { x: number; y: number }) => {
    const b = o.body;
    let dx = rand(-1, 1);
    let dy = rand(-0.6, 1);
    if (from) {
      dx = b.pos.x - from.x || dx;
      dy = b.pos.y - from.y || dy;
    }
    const len = Math.hypot(dx, dy) || 1;
    const k = tuning.kickStrength;
    impulse(
      b,
      vec3((dx / len) * k, (dy / len) * k, rand(-0.25, 0.25) * k),
      vec3(
        rand(-1, 1) * tuning.kickSpin,
        rand(-1, 1) * tuning.kickSpin,
        rand(-0.5, 0.5) * tuning.kickSpin,
      ),
      now(),
      tuning.returnDelay,
    );
    countKick();
  };

  const launch = () => {
    const t = now();
    objs.current.forEach((o) => {
      if (o.entry.type === 'ball') return;
      if (!animate) {
        o.fadeAt = t;
        return;
      }
      const dir = o.body.pos.x > 0 ? -1 : 1;
      o.launchUntil = t + tuning.launchSeconds;
      o.body.wrap = true;
      o.body.vel.x = dir * tuning.launchSpeed;
      o.body.vel.y *= 0.2;
      o.body.freeUntil = t + tuning.launchSeconds + tuning.returnDelay * 0.5;
    });
    useStore.getState().announceSpace('Ships launched.');
    invalidate();
  };

  const spawn = (kind: SpaceKind) => {
    const s = useStore.getState();
    if (objs.current.length >= tuning.maxObjects) {
      s.announceSpace(`Space is full: ${tuning.maxObjects} objects max.`);
      return;
    }
    const entry =
      entries.find((e) => e.type === kind && e.enabled) ?? entries.find((e) => e.type === kind);
    if (!entry) return;
    const n = objs.current.filter((o) => o.entry.id === entry.id).length + 1;
    let id = `${entry.id}-${n}`;
    while (objs.current.some((o) => o.id === id)) id += 'x';
    const { tanHalf, aspect } = view();
    const side = Math.random() < 0.5 ? -1 : 1;
    const moved: SpaceObjectEntry = {
      ...entry,
      start: [side * rand(0.55, 0.85), rand(-0.6, 0.6), entry.start[2] + rand(-1.5, 1.5)],
    };
    publish([...objs.current, makeObj(moved, id, startFor(moved, tanHalf, aspect))]);
    s.announceSpace(`Spawned ${entry.label}.`);
  };

  const runCommand = (c: SpaceCommand) => {
    switch (c.type) {
      case 'spawn':
        return spawn(c.kind);
      case 'reset':
        resetObjects();
        return useStore.getState().announceSpace('Space objects reset.');
      case 'launch':
        return launch();
      case 'kick': {
        const ball = objs.current.find((o) => (c.id ? o.id === c.id : o.entry.type === 'ball'));
        if (ball) interact(ball);
        else useStore.getState().announceSpace('No football to kick. Try spawn ball.');
        return;
      }
      case 'interact': {
        const o = objs.current.find((x) => x.id === c.id);
        if (o) interact(o);
        return;
      }
    }
  };

  // ---------- pointer: hover, drag/throw, click, double-click ----------
  const input = useRef({
    ndcX: 0,
    ndcY: 0,
    exposed: false,
    hover: null as Obj | null,
    drag: null as null | {
      o: Obj;
      mode: 'rotate' | 'move';
      x0: number;
      y0: number;
      t0: number;
      lx: number;
      ly: number;
      lt: number;
      moved: boolean;
      vx: number;
      vy: number;
      wx: number;
      wy: number;
    },
    lastClick: { id: '', t: 0, x: 0, y: 0 },
  });

  /** Nearest object under an NDC point (ray vs bounding sphere). */
  const pick = (x: number, y: number): Obj | null => {
    const r = root.current;
    if (!r) return null;
    scratch.ndc.set(x, y);
    scratch.ray.origin.setFromMatrixPosition(camera.matrixWorld);
    scratch.ray.direction.set(x, y, 0.5).unproject(camera).sub(scratch.ray.origin).normalize();
    let best: Obj | null = null;
    let bestD = Infinity;
    for (const o of objs.current) {
      if (!o.outer) continue;
      o.outer.getWorldPosition(scratch.v);
      const radius = HIT_RADIUS * o.outer.scale.x;
      if (scratch.ray.distanceSqToPoint(scratch.v) > radius * radius) continue;
      const d = scratch.v.distanceToSquared(scratch.ray.origin);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  };

  useEffect(() => {
    const st = input.current;
    const toNdc = (e: PointerEvent) => {
      st.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      st.ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const depthHalf = (o: Obj) => {
      const { tanHalf, aspect } = view();
      const depth = -o.body.pos.z;
      return { hw: depth * tanHalf * aspect, hh: depth * tanHalf };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !isExposed(e.target)) return;
      toNdc(e);
      // Double-click: a second press close to the previous click opens the info card, even if
      // the first click sent the object (e.g. a kicked football) flying.
      const last = st.lastClick;
      if (
        last.id &&
        performance.now() - last.t < DOUBLE_MS &&
        Math.hypot(e.clientX - last.x, e.clientY - last.y) < DOUBLE_PX
      ) {
        e.preventDefault();
        const o = objs.current.find((x) => x.id === last.id);
        if (o) useStore.getState().setSpaceTooltip(o.entry.id);
        st.lastClick = { id: '', t: 0, x: 0, y: 0 };
        return;
      }
      const o = pick(st.ndcX, st.ndcY);
      if (!o) return;
      e.preventDefault();
      spaceInput.dragging = true;
      const move = e.shiftKey || useStore.getState().spaceDragMode === 'move';
      const t = performance.now();
      st.drag = {
        o,
        mode: move ? 'move' : 'rotate',
        x0: e.clientX,
        y0: e.clientY,
        t0: t,
        lx: e.clientX,
        ly: e.clientY,
        lt: t,
        moved: false,
        vx: 0,
        vy: 0,
        wx: 0,
        wy: 0,
      };
      if (move) o.body.held = true;
      invalidate();
    };

    const onMove = (e: PointerEvent) => {
      toNdc(e);
      st.exposed = isExposed(e.target);
      const d = st.drag;
      if (!d) return;
      const t = performance.now();
      const dt = Math.max((t - d.lt) / 1000, 1 / 240);
      const dx = e.clientX - d.lx;
      const dy = e.clientY - d.ly;
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > CLICK_PX) d.moved = true;
      if (d.mode === 'rotate') {
        const ax = dy * 0.01;
        const ay = dx * 0.01;
        scratch.q.setFromAxisAngle(scratch.axis.set(1, 0, 0), ax);
        d.o.quat.premultiply(scratch.q);
        scratch.q.setFromAxisAngle(scratch.axis.set(0, 1, 0), ay);
        d.o.quat.premultiply(scratch.q);
        d.wx += (ax / dt - d.wx) * 0.5;
        d.wy += (ay / dt - d.wy) * 0.5;
      } else {
        const { hw, hh } = depthHalf(d.o);
        const px = d.o.body.pos.x;
        const py = d.o.body.pos.y;
        d.o.body.pos.x = st.ndcX * hw;
        d.o.body.pos.y = st.ndcY * hh;
        d.vx += ((d.o.body.pos.x - px) / dt - d.vx) * 0.5;
        d.vy += ((d.o.body.pos.y - py) / dt - d.vy) * 0.5;
      }
      d.lx = e.clientX;
      d.ly = e.clientY;
      d.lt = t;
      invalidate();
    };

    const onUp = (e: PointerEvent) => {
      const d = st.drag;
      if (!d) return;
      st.drag = null;
      spaceInput.dragging = false;
      const o = d.o;
      o.body.held = false;
      const t = performance.now();
      if (!d.moved && t - d.t0 < CLICK_MS) {
        toNdc(e);
        const { hw, hh } = depthHalf(o);
        interact(o, { x: st.ndcX * hw, y: st.ndcY * hh });
        st.lastClick = { id: o.id, t, x: e.clientX, y: e.clientY };
        return;
      }
      if (!animate) return;
      const tNow = now();
      if (d.mode === 'rotate') {
        o.body.spin.x += d.wx;
        o.body.spin.y += d.wy;
      } else {
        impulse(o.body, vec3(d.vx, d.vy, 0), vec3(), tNow, tuning.returnDelay);
      }
      invalidate();
    };

    const onCancel = () => {
      if (st.drag) st.drag.o.body.held = false;
      st.drag = null;
      spaceInput.dragging = false;
    };

    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.documentElement.classList.remove('space-hover', 'space-grabbing');
      spaceInput.dragging = false;
    };
    // Handlers read live state through refs; re-binding on every render is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, size, animate]);

  // ---------- simulation ----------
  const playRef = useRef(playground ? 1 : 0);
  const labelGroup = useRef<Group>(null);

  useFrame((_, delta) => {
    const r = root.current;
    if (!r) return;
    const dt = Math.min(delta, 0.1);
    const t = now();
    r.position.copy(camera.position);
    r.quaternion.copy(camera.quaternion);
    r.updateMatrixWorld();

    while (spaceQueue.length) {
      const c = spaceQueue.shift();
      if (c) runCommand(c);
    }

    const target = playground ? 1 : 0;
    playRef.current = animate
      ? playRef.current + (target - playRef.current) * (1 - Math.exp(-dt * 5))
      : target;
    const p = playRef.current;
    const closer = 1 - tuning.playgroundCloser * p;
    const grow = 1 + (tuning.playgroundScale - 1) * p;
    const { tanHalf, aspect } = view();
    const st = input.current;
    const f = pointerField;
    const focus = useStore.getState().spaceFocus;
    let busy = false;

    // Hover (raw pointer for precise picking; only where the canvas is exposed).
    const hover = st.drag?.o ?? (st.exposed || playground ? pick(st.ndcX, st.ndcY) : null);
    if (hover !== st.hover) {
      st.hover = hover;
      setLabelId(hover?.id ?? null);
    }
    const html = document.documentElement;
    html.classList.toggle('space-hover', !!hover && !st.drag);
    html.classList.toggle('space-grabbing', !!st.drag);

    for (const o of objs.current) {
      const b = o.body;
      const depth = -o.start.z;
      const hw = depth * tanHalf * aspect;
      const hh = depth * tanHalf;
      const amp = tuning.driftAmplitude;
      const w = 0.12 * o.entry.driftSpeed * tuning.driftSpeed;
      const home = animate
        ? vec3(
            o.start.x + Math.sin(t * w + o.phase) * hw * amp,
            o.start.y + Math.sin(t * w * 1.3 + o.phase * 2) * hh * amp * 0.8,
            o.start.z + Math.sin(t * w * 0.7 + o.phase) * depth * 0.08,
          )
        : o.start;

      if (animate && f.active && f.presence > 0 && o !== hover) {
        const bd = -b.pos.z;
        repel(
          b,
          { x: f.x * bd * tanHalf * aspect, y: f.y * bd * tanHalf },
          tuning.repelRadius,
          tuning.repelStrength * f.presence * f.damping,
          dt,
        );
      }
      if (animate) {
        step(b, {
          dt,
          now: t,
          home,
          damping: tuning.throwDamping,
          spinDamping: tuning.spinDamping,
          stiffness: tuning.returnStiffness,
          restitution: tuning.restitution,
          bounds: { x: hw * 1.05, y: hh * 0.95, zNear: depth * 0.6, zFar: depth * 1.4 },
        });
      } else if (!b.held) {
        b.pos.x = home.x;
        b.pos.y = home.y;
        b.pos.z = home.z;
      }
      if (b.wrap && t > o.launchUntil) b.wrap = false;

      // Orientation: integrate spin around view axes, plus a gentle idle tumble.
      const idle = animate ? 0.15 * o.entry.driftSpeed : 0;
      const sx = b.spin.x * dt;
      const sy = (b.spin.y + (o.entry.type === 'ball' ? idle : 0)) * dt;
      const sz = b.spin.z * dt;
      if (sx || sy || sz) {
        scratch.q.setFromAxisAngle(scratch.axis.set(1, 0, 0), sx);
        o.quat.premultiply(scratch.q);
        scratch.q.setFromAxisAngle(scratch.axis.set(0, 1, 0), sy);
        o.quat.premultiply(scratch.q);
        scratch.q.setFromAxisAngle(scratch.axis.set(0, 0, 1), sz);
        o.quat.premultiply(scratch.q);
      }

      const outer = o.outer;
      const inner = o.inner;
      if (!outer || !inner) continue;
      const lit = o === hover || o.id === focus || t - o.fadeAt < 0.9;
      const scale = o.entry.size * (lowPower ? tuning.lowPower.scale : 1) * grow * (lit ? 1.08 : 1);
      outer.position.set(b.pos.x * closer, b.pos.y * closer, b.pos.z * closer);
      outer.quaternion.copy(o.quat);
      outer.scale.setScalar(scale);
      if (lit !== o.lit) {
        o.lit = lit;
        o.parts.forEach((part) => (part.object.material = lit ? part.hi : part.base));
      }

      // Per-kind reactions.
      if (o.entry.type === 'station') {
        const boost = Math.max(0, 1 - (t - o.spinAt) / 2) ** 2;
        o.ringAngle += (idle * 0.8 + boost * 6) * dt;
        inner.rotation.z = o.ringAngle;
        if (o.pods) {
          const flashing = t - o.flashAt < 2;
          const lead = Math.floor((t - o.flashAt) * 12) % POD_COUNT;
          for (let i = 0; i < POD_COUNT; i++) {
            o.pods.setColorAt(i, scratch.c.setScalar(flashing && i === lead ? 3 : 1));
          }
          if (o.pods.instanceColor) o.pods.instanceColor.needsUpdate = true;
          busy ||= flashing || boost > 0;
        }
      } else if (o.entry.type === 'saucer') {
        const rt = (t - o.rollAt) / 1.1;
        const roll = rt >= 0 && rt < 1 ? easeInOut(rt) * Math.PI * 2 : 0;
        inner.rotation.z = roll + (animate ? Math.sin(t * 0.9 + o.phase) * 0.12 : 0);
        inner.rotation.x = animate ? Math.sin(t * 0.7 + o.phase) * 0.08 : 0;
        inner.position.y = animate ? Math.sin(t * 1.4 + o.phase) * 0.06 : 0;
        if (o.beam) {
          const bt = (t - o.rollAt) / 1.6;
          const on = bt >= 0 && bt < 1;
          o.beam.visible = on;
          if (on) (o.beam.material as MeshBasicMaterial).opacity = Math.sin(bt * Math.PI) * 0.35;
          busy ||= on;
        }
      } else if (isShip(o.entry.type)) {
        const kind = o.entry.type;
        const span = { rocket: 2.2, delorean: 1.8, falcon: 1.6, walle: 2.4, milano: 1.1 }[kind];
        const rt = (t - o.rollAt) / span;
        const on = rt >= 0 && rt < 1;
        const bob = animate ? Math.sin(t * 1.2 + o.phase) * 0.05 : 0;
        const flicker = animate ? 0.85 + Math.sin(t * 37 + o.phase) * 0.1 + Math.sin(t * 23) * 0.05 : 1;
        // Outer-local point / direction → root space (where particles live).
        const at = (x: number, y: number, z: number) =>
          scratch.w.set(x, y, z).multiplyScalar(scale).applyQuaternion(outer.quaternion).add(outer.position);
        const dir = (x: number, y: number, z: number) =>
          scratch.v.set(x, y, z).applyQuaternion(outer.quaternion);
        let glow = IDLE_GLOW;
        let stretch = flicker;
        inner.position.set(0, bob, 0);
        inner.rotation.set(0, 0, 0);
        inner.scale.setScalar(1);

        if (kind === 'rocket') {
          const burn = on ? Math.sin(rt * Math.PI) : 0;
          inner.position.y = bob + burn * 0.6;
          glow = IDLE_GLOW + burn * 0.75;
          stretch = (0.7 + burn * 1.4) * flicker;
          if (trails && burn > 0.2) {
            emit(
              at(rand(-0.08, 0.08), inner.position.y - 1, rand(-0.08, 0.08)),
              dir(rand(-0.3, 0.3), -3, rand(-0.3, 0.3)),
              colorFor('amber', colors),
              0.7,
            );
          }
        } else if (kind === 'delorean' || kind === 'falcon') {
          // Accelerate forward, vanish, then pop back in: 88 mph / the jump to lightspeed.
          if (on && rt < 0.35) {
            const k = rt / 0.35;
            inner.position.x = k * k * 3;
            if (kind === 'falcon') inner.scale.x = 1 + k * 2.5;
            glow = IDLE_GLOW + k * 0.8;
            if (trails && kind === 'delorean') {
              for (const s of [-1, 1]) {
                emit(at(inner.position.x - 0.48, -0.14, s * 0.33), dir(0, 0.15, 0), colorFor('amber', colors), 1.4);
              }
            } else if (trails) {
              emit(
                at(inner.position.x - 0.6, rand(-0.05, 0.05), rand(-0.45, 0.45)),
                dir(-8, 0, 0),
                colors.cyan as Color,
                0.45,
              );
            }
          } else if (on && rt < 0.7) {
            inner.scale.setScalar(0.001);
            glow = 0;
          } else if (on) {
            const k = easeInOut((rt - 0.7) / 0.3);
            inner.scale.setScalar(Math.max(k, 0.001));
            glow = IDLE_GLOW + (1 - k) * 0.8;
          }
          if (kind === 'delorean') inner.rotation.z += animate ? Math.sin(t * 0.8 + o.phase) * 0.05 : 0;
        } else if (kind === 'walle') {
          const look = on
            ? Math.sin(rt * Math.PI * 3) * 0.8 * Math.sin(rt * Math.PI)
            : animate
              ? Math.sin(t * 0.45 + o.phase) * 0.25
              : 0;
          if (o.head) {
            o.head.rotation.y = look;
            o.head.rotation.x = on ? -Math.sin(rt * Math.PI) * 0.12 : 0;
          }
          inner.position.y = bob + (on ? Math.abs(Math.sin(rt * Math.PI * 4)) * 0.1 * (1 - rt) : 0);
          glow = IDLE_GLOW + (on ? Math.sin(rt * Math.PI) * 0.6 : 0);
          stretch = 1;
        } else {
          const roll = on ? easeInOut(rt) * Math.PI * 2 : 0;
          inner.rotation.x = roll + (animate ? Math.sin(t * 0.9 + o.phase) * 0.1 : 0);
          glow = IDLE_GLOW + (on ? 0.7 : 0);
          stretch = (on ? 1.8 : 1) * flicker;
          if (trails && on) {
            for (const s of [-1, 1]) {
              emit(at(-0.9, 0, s * 0.09), dir(-3, 0, 0), colorFor('magenta', colors), 0.5);
            }
          }
        }

        if (o.glow) {
          (o.glow.material as MeshBasicMaterial).opacity = Math.min(glow, 1) * (kind === 'walle' ? 1 : flicker);
          const axis = assets.ships[kind].glowAxis;
          o.glow.scale.setScalar(1);
          if (axis) o.glow.scale[axis] = stretch;
        }
        busy ||= on;
      }
      busy ||= t - o.fadeAt < 0.9;

      // Trails: football when moving fast, ships while launched.
      if (trails) {
        const speed = Math.hypot(b.vel.x, b.vel.y, b.vel.z);
        const launched = t < o.launchUntil;
        if ((o.entry.type === 'ball' && speed > 2) || launched) {
          const c = (o.entry.type === 'ball' ? colors.magenta : colors.cyan) as Color;
          const back = launched ? -Math.sign(b.vel.x) * 0.6 * scale : 0;
          emit(
            vec3(outer.position.x + back, outer.position.y + rand(-0.05, 0.05), outer.position.z),
            vec3(
              -b.vel.x * 0.15 + rand(-0.3, 0.3),
              -b.vel.y * 0.15 + rand(-0.3, 0.3),
              rand(-0.2, 0.2),
            ),
            c,
            launched ? 0.6 : 0.8,
          );
        }
      }
    }

    // Hover / focus label rides just above its object.
    const labelled = hover ?? objs.current.find((o) => o.id === focus);
    if (labelGroup.current && labelled?.outer) {
      labelGroup.current.position.copy(labelled.outer.position);
      labelGroup.current.position.y += 0.95 * labelled.outer.scale.y;
    }

    // Particle pool update.
    const pos = particles.geo.attributes.position as BufferAttribute;
    const col = particles.geo.attributes.color as BufferAttribute;
    let alive = false;
    for (let i = 0; i < particles.n; i++) {
      const life = particles.life[i] ?? 0;
      if (life <= 0) {
        col.setXYZ(i, 0, 0, 0);
        continue;
      }
      alive = true;
      const next = Math.max(0, life - dt);
      particles.life[i] = next;
      const k = next / (particles.max[i] || 1);
      pos.setXYZ(
        i,
        pos.getX(i) + (particles.vel[i * 3] ?? 0) * dt,
        pos.getY(i) + (particles.vel[i * 3 + 1] ?? 0) * dt,
        pos.getZ(i) + (particles.vel[i * 3 + 2] ?? 0) * dt,
      );
      col.setXYZ(
        i,
        (particles.base[i * 3] ?? 0) * k,
        (particles.base[i * 3 + 1] ?? 0) * k,
        (particles.base[i * 3 + 2] ?? 0) * k,
      );
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    // Reduced motion runs on demand: keep rendering only while a fade/reaction is visible.
    if (!animate && (busy || alive)) invalidate();
  });

  const labelObj = list.find((o) => o.id === labelId) ?? null;
  const focusId = useStore((s) => s.spaceFocus);
  const shownLabel = labelObj ?? list.find((o) => o.id === focusId) ?? null;

  return (
    <group ref={root}>
      {list.map((o) => (
        <SpaceObjectView
          key={o.id}
          obj={o}
          colors={colors}
          geo={assets.geo}
          ships={assets.ships}
        />
      ))}
      <points geometry={particles.geo} frustumCulled={false}>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <group ref={labelGroup}>
        {shownLabel && (
          <Html center style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
            <span className="space-label">{shownLabel.entry.label}</span>
          </Html>
        )}
      </group>
    </group>
  );
}

/** One object: shared geometry + per-colour shared materials; registers its parts on `obj`. */
function SpaceObjectView({
  obj,
  colors,
  geo,
  ships,
}: {
  obj: Obj;
  colors: SceneColors;
  geo: ReturnType<typeof acquireAssets>['geo'];
  ships: ReturnType<typeof acquireAssets>['ships'];
}) {
  const mats = materialsFor(obj.entry.color, colors);
  const kind = obj.entry.type;
  const ship = isShip(kind) ? ships[kind] : null;
  const glowMat = useMemo(
    () =>
      isShip(kind)
        ? new MeshBasicMaterial({
            color: colorFor(GLOW[kind], colors),
            transparent: true,
            opacity: IDLE_GLOW,
            depthWrite: false,
            blending: AdditiveBlending,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => glowMat?.dispose(), [glowMat]);
  useEffect(() => {
    if (glowMat && isShip(kind)) glowMat.color.copy(colorFor(GLOW[kind], colors));
  }, [glowMat, colors, kind]);
  const beamMat = useMemo(
    () =>
      obj.entry.type === 'saucer'
        ? new MeshBasicMaterial({
            color: colors.green,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: AdditiveBlending,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => beamMat?.dispose(), [beamMat]);
  useEffect(() => {
    beamMat?.color.copy(colors.green);
  }, [beamMat, colors]);

  const reg = (base: Material, hi: Material) => (m: Swappable | null) => {
    if (!m) return;
    obj.parts = obj.parts.filter((p) => p.object !== m);
    obj.parts.push({ object: m, base, hi });
  };

  const podsRef = (m: InstancedMesh | null) => {
    if (!m) return;
    layoutPods(m);
    for (let i = 0; i < POD_COUNT; i++) m.setColorAt(i, WHITE);
    obj.pods = m;
    reg(mats.wire, mats.wireHi)(m);
  };

  return (
    <group ref={(g) => (obj.outer = g)}>
      <group ref={(g) => (obj.inner = g)}>
        {obj.entry.type === 'station' && (
          <>
            <mesh geometry={geo.station} material={mats.fill} />
            <lineSegments
              ref={reg(mats.line, mats.lineHi) as never}
              geometry={geo.stationEdges}
              material={mats.line}
            />
            <instancedMesh ref={podsRef} args={[geo.pod, mats.wire, POD_COUNT]} />
            <instancedMesh
              args={[geo.pod, mats.fill, POD_COUNT]}
              ref={(m) => {
                if (m) layoutPods(m);
              }}
            />
          </>
        )}
        {obj.entry.type === 'saucer' && (
          <>
            <mesh geometry={geo.saucer} material={mats.fill} />
            <lineSegments
              ref={reg(mats.line, mats.lineHi) as never}
              geometry={geo.saucerEdges}
              material={mats.line}
            />
            <mesh ref={reg(mats.glass, mats.fillHi)} geometry={geo.dome} material={mats.glass} />
            <mesh
              ref={(m) => (obj.beam = m)}
              geometry={geo.beam}
              material={beamMat ?? undefined}
              visible={false}
            />
          </>
        )}
        {obj.entry.type === 'ball' && (
          <>
            <mesh ref={reg(mats.fill, mats.fillHi)} geometry={geo.ballFill} material={mats.fill} />
            <lineSegments
              ref={reg(mats.lineVc, mats.lineVcHi) as never}
              geometry={geo.ballLines}
              material={mats.lineVc}
            />
            <points geometry={geo.ballPoints} material={mats.points} />
          </>
        )}
        {ship && (
          <>
            <mesh geometry={ship.body} material={mats.fill} />
            <lineSegments
              ref={reg(mats.line, mats.lineHi) as never}
              geometry={ship.edges}
              material={mats.line}
            />
            {ship.glow && !ship.glowOnHead && (
              <mesh
                ref={(m) => (obj.glow = m)}
                geometry={ship.glow}
                material={glowMat ?? undefined}
                position={ship.glowAt}
              />
            )}
            {ship.head && (
              <group ref={(g) => (obj.head = g)}>
                <mesh geometry={ship.head.body} material={mats.fill} />
                <lineSegments
                  ref={reg(mats.line, mats.lineHi) as never}
                  geometry={ship.head.edges}
                  material={mats.line}
                />
                {ship.glow && ship.glowOnHead && (
                  <mesh
                    ref={(m) => (obj.glow = m)}
                    geometry={ship.glow}
                    material={glowMat ?? undefined}
                  />
                )}
              </group>
            )}
          </>
        )}
      </group>
    </group>
  );
}

const WHITE = new Color(1, 1, 1);

/** Twelve pods evenly spaced around the ring, alternating sizes. */
function layoutPods(m: InstancedMesh) {
  const tmp = new Matrix4();
  const q = new Quaternion();
  const s = new Vector3();
  const p = new Vector3();
  const z = new Vector3(0, 0, 1);
  for (let i = 0; i < POD_COUNT; i++) {
    const a = (i / POD_COUNT) * Math.PI * 2;
    p.set(Math.cos(a) * 0.68, Math.sin(a) * 0.68, 0);
    q.setFromAxisAngle(z, a);
    s.setScalar(i % 2 ? 0.8 : 1);
    m.setMatrixAt(i, tmp.compose(p, q, s));
  }
  m.instanceMatrix.needsUpdate = true;
}

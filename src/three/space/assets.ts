import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  LineBasicMaterial,
  type Material,
  MeshBasicMaterial,
  PointsMaterial,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { ColorToken } from '../../data/types';
import type { SceneColors } from '../colors';

/** Low-poly, unit-sized models (≈1.5 units across at size 1), shared by every instance. */
function stationBody(): BufferGeometry {
  const hub = new CylinderGeometry(0.2, 0.2, 0.34, 10).rotateX(Math.PI / 2);
  const spine = new CylinderGeometry(0.05, 0.05, 1, 6).rotateX(Math.PI / 2);
  const ring = new TorusGeometry(0.68, 0.025, 4, 36);
  const spokes = [0, 1, 2, 3].map((i) =>
    new BoxGeometry(0.03, 0.48, 0.03).translate(0, 0.44, 0).rotateZ((i * Math.PI) / 2),
  );
  return mergeGeometries([hub, spine, ring, ...spokes].map((g) => g.toNonIndexed()));
}

function stationPod(): BufferGeometry {
  const box = new BoxGeometry(0.2, 0.15, 0.17);
  const cap = new CylinderGeometry(0.05, 0.05, 0.08, 6).rotateX(Math.PI / 2).translate(0, 0, 0.12);
  return mergeGeometries([box.toNonIndexed(), cap.toNonIndexed()]);
}

/**
 * Rick's space cruiser (Rick and Morty): cobbled-together saucer with an open two-seat cockpit
 * under a glass bubble, swept tail fins and twin thrusters at the back, headlights up front,
 * a bolted rim band, stubby landing legs and a bent side antenna with a dish. Front faces +z.
 */
function saucerBody(): BufferGeometry {
  const hull = new LatheGeometry(
    v2([
      [0, -0.13],
      [0.42, -0.1],
      [0.8, 0],
      [0.44, 0.11],
      [0.2, 0.15],
      [0, 0.15],
    ]),
    24,
  );
  const rim = new TorusGeometry(0.79, 0.03, 4, 32).rotateX(Math.PI / 2);
  const deckRing = new TorusGeometry(0.47, 0.012, 3, 28).rotateX(Math.PI / 2).translate(0, 0.105, 0);
  const bolts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return new BoxGeometry(0.04, 0.05, 0.04).translate(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8);
  });

  // Cockpit: two seats facing forward and a steering wheel on a column, inside the dome.
  const seats = [-1, 1].flatMap((s) => [
    new BoxGeometry(0.1, 0.04, 0.09).translate(s * 0.08, 0.17, -0.02),
    new BoxGeometry(0.1, 0.12, 0.025).translate(s * 0.08, 0.22, -0.075),
  ]);
  const column = strut(new Vector3(-0.08, 0.15, 0.13), new Vector3(-0.08, 0.24, 0.07), 0.015);
  const wheel = new TorusGeometry(0.045, 0.008, 4, 14)
    .rotateX(-0.6)
    .translate(-0.08, 0.245, 0.065);

  // Rear: twin thrusters and two swept tail fins canted outwards.
  const thrusters = [-1, 1].flatMap((s) => [
    new CylinderGeometry(0.07, 0.08, 0.24, 10).rotateX(Math.PI / 2).translate(s * 0.22, 0.02, -0.72),
    new CylinderGeometry(0.06, 0.1, 0.08, 10, 1, true).rotateX(Math.PI / 2).translate(s * 0.22, 0.02, -0.87),
  ]);
  const fin = (s: number) =>
    new ExtrudeGeometry(
      shapeOf([
        [-0.5, 0.06],
        [-0.78, 0.04],
        [-0.98, 0.4],
        [-0.86, 0.42],
      ]),
      { depth: 0.03, bevelEnabled: false },
    )
      .rotateY(-Math.PI / 2)
      .translate(0.015, 0, 0)
      .rotateZ(-s * 0.35)
      .translate(s * 0.36, 0, 0);

  // Front: headlights and a bumper strip.
  const lights = [-1, 1].map((s) =>
    new CylinderGeometry(0.045, 0.045, 0.05, 10).rotateX(Math.PI / 2).translate(s * 0.22, 0.01, 0.78),
  );
  const bumper = new BoxGeometry(0.3, 0.03, 0.03).translate(0, -0.04, 0.8);

  // Underside: three stubby landing legs with pads.
  const legs = [0, 1, 2].flatMap((i) => {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const rot = (g: BufferGeometry) => g.rotateY(a);
    return [
      rot(strut(new Vector3(0.3, -0.11, 0), new Vector3(0.42, -0.3, 0), 0.025)),
      rot(new CylinderGeometry(0.05, 0.05, 0.015, 8).translate(0.42, -0.31, 0)),
    ];
  });

  // Bent side antenna with a little dish.
  const mast = new CylinderGeometry(0.012, 0.012, 0.46, 4).rotateZ(-0.35).translate(0.7, 0.24, 0);
  const dish = new ConeGeometry(0.08, 0.03, 10, 1, true)
    .rotateZ(Math.PI / 2 + 0.5)
    .translate(0.8, 0.46, 0);

  return merge([
    hull,
    rim,
    deckRing,
    ...bolts,
    ...seats,
    column,
    wheel,
    ...thrusters,
    fin(1),
    fin(-1),
    ...lights,
    bumper,
    ...legs,
    mast,
    dish,
  ]);
}

const merge = (parts: BufferGeometry[]) =>
  mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)));

const v2 = (pts: number[][]) => pts.map(([x = 0, y = 0]) => new Vector2(x, y));

function shapeOf(pts: number[][]): Shape {
  return new Shape(v2(pts));
}

/** Extrude a plan-view outline given as (x, z) points into a slab `thickness` tall, centred on y = 0. */
function plan(pts: number[][], thickness: number): BufferGeometry {
  return new ExtrudeGeometry(shapeOf(pts), { depth: thickness, bevelEnabled: false })
    .rotateX(Math.PI / 2)
    .translate(0, thickness / 2, 0);
}

/** A thin box from point a to point b (struts, legs). */
function strut(a: Vector3, b: Vector3, w: number): BufferGeometry {
  const d = b.clone().sub(a);
  const g = new BoxGeometry(w, d.length(), w);
  const up = new Vector3(0, 1, 0);
  const axis = up.clone().cross(d).normalize();
  const angle = Math.acos(up.dot(d.clone().normalize()));
  if (axis.lengthSq() > 0) g.applyQuaternion(new Quaternion().setFromAxisAngle(axis, angle));
  return g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
}

/**
 * Mars Ascent Vehicle from The Martian: tall faceted capsule with a pointed nose, segment bands,
 * a window band, RCS quads, four splayed landing legs and a bell nozzle. Upright, nose +y.
 */
function rocketBody(): BufferGeometry {
  const hull = new LatheGeometry(
    v2([
      [0, -0.6],
      [0.2, -0.6],
      [0.33, -0.5],
      [0.31, -0.38],
      [0.3, -0.36],
      [0.3, 0.12],
      [0.27, 0.28],
      [0.18, 0.46],
      [0.1, 0.57],
      [0.05, 0.66],
      [0, 0.68],
    ]),
    8,
  );
  const bands = [-0.36, -0.12, 0.12].map((y) =>
    new TorusGeometry(0.305, 0.012, 3, 16).rotateX(Math.PI / 2).translate(0, y, 0),
  );
  const nozzle = new CylinderGeometry(0.1, 0.17, 0.14, 10, 1, true).translate(0, -0.67, 0);
  const parts: BufferGeometry[] = [hull, ...bands, nozzle];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const rot = (g: BufferGeometry) => g.rotateY(a);
    parts.push(
      rot(strut(new Vector3(0.29, -0.28, 0), new Vector3(0.6, -0.74, 0), 0.035)),
      rot(strut(new Vector3(0.31, -0.5, 0), new Vector3(0.5, -0.6, 0), 0.025)),
      rot(new CylinderGeometry(0.08, 0.08, 0.02, 8).translate(0.6, -0.75, 0)),
      rot(new BoxGeometry(0.07, 0.07, 0.05).translate(0, 0.36, 0.25)),
    );
    parts.push(new BoxGeometry(0.1, 0.06, 0.02).translate(0, 0.2, 0.3).rotateY(a - Math.PI / 4));
  }
  return merge(parts);
}

/** Main-engine flame, base at the origin, pointing -y. */
function rocketFlame(): BufferGeometry {
  return new ConeGeometry(0.15, 0.6, 10, 1, true).rotateX(Math.PI).translate(0, -0.3, 0);
}

/**
 * DeLorean time machine (Back to the Future Part II, flight mode): wedge body with cut-out
 * wheel arches and windows, open gull-wing doors, wheels folded flat, rear reactor vents,
 * exhausts and Mr. Fusion on the engine deck. Side profile in x / y, nose +x.
 */
function deloreanBody(): BufferGeometry {
  const side = new Shape();
  side.moveTo(0.78, -0.1);
  side.lineTo(0.8, -0.02);
  side.lineTo(0.6, 0.05);
  side.lineTo(0.2, 0.1);
  side.lineTo(-0.02, 0.27);
  side.lineTo(-0.3, 0.27);
  side.lineTo(-0.6, 0.12);
  side.lineTo(-0.8, 0.1);
  side.lineTo(-0.8, -0.1);
  side.lineTo(-0.62, -0.1);
  side.absarc(-0.48, -0.1, 0.14, Math.PI, 0, true);
  side.lineTo(0.34, -0.1);
  side.absarc(0.48, -0.1, 0.14, Math.PI, 0, true);
  side.lineTo(0.78, -0.1);
  side.holes.push(
    shapeOf([
      [0.14, 0.12],
      [-0.03, 0.235],
      [-0.27, 0.235],
      [-0.42, 0.14],
    ]),
  );
  const body = new ExtrudeGeometry(side, { depth: 0.6, bevelEnabled: false }).translate(0, 0, -0.3);
  const door = (s: number) =>
    new BoxGeometry(0.36, 0.012, 0.3)
      .translate(0, 0, s * 0.15)
      .rotateX(-s * 0.65)
      .translate(-0.13, 0.27, s * 0.1);
  const wheels = [-0.48, 0.48].flatMap((x) =>
    [-1, 1].map((s) => new CylinderGeometry(0.13, 0.13, 0.06, 12).translate(x, -0.12, s * 0.33)),
  );
  const fusion = new CylinderGeometry(0.035, 0.05, 0.1, 8).translate(-0.68, 0.16, 0);
  const vents = [-1, 1].map((s) => new BoxGeometry(0.2, 0.05, 0.07).translate(-0.58, 0.14, s * 0.2));
  const pipes = [-1, 1].map((s) =>
    new CylinderGeometry(0.03, 0.03, 0.14, 6).rotateZ(Math.PI / 2).translate(-0.85, -0.02, s * 0.18),
  );
  const coils = [-1, 1].map((s) => new BoxGeometry(0.3, 0.03, 0.02).translate(-0.5, 0.02, s * 0.31));
  return merge([body, door(1), door(-1), ...wheels, fusion, ...vents, ...pipes, ...coils]);
}

/** Flux glow over the rear reactor vents and the time-circuit coils. */
function deloreanGlow(): BufferGeometry {
  return merge([
    ...[-1, 1].map((s) => new BoxGeometry(0.22, 0.06, 0.08).translate(-0.58, 0.15, s * 0.2)),
    ...[-1, 1].map((s) => new BoxGeometry(0.32, 0.04, 0.03).translate(-0.5, 0.02, s * 0.32)),
  ]);
}

/**
 * Millennium Falcon: saucer hull with twin forward mandibles, cockpit tube off the starboard
 * side, top quad-laser turret, offset radar dish and docking rings. Plan in x / z, nose +x.
 */
function falconBody(): BufferGeometry {
  // Plan outline: round hull, two forward mandibles and the cargo slot between them.
  const R = 0.6;
  const shoulder = Math.asin(0.36 / R);
  const outline: number[][] = [];
  for (let i = 0; i <= 40; i++) {
    const a = -shoulder - (i / 40) * (Math.PI * 2 - 2 * shoulder);
    outline.push([Math.cos(a) * R, Math.sin(a) * R]);
  }
  outline.push(
    [0.95, 0.28],
    [0.98, 0.22],
    [0.96, 0.075],
    [0.42, 0.075],
    [0.42, -0.075],
    [0.96, -0.075],
    [0.98, -0.22],
    [0.95, -0.28],
  );
  const slab = plan(outline, 0.08);
  const dome = (s: number) =>
    new LatheGeometry(
      v2([
        [0.4, s * 0.04],
        [0.36, s * 0.07],
        [0.22, s * 0.1],
        [0, s * 0.11],
      ]),
      24,
    );

  // Radial hull ribs (the trenches between plating sections), skipping the front.
  const ribs = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI * 0.32 + (i / 9) * Math.PI * 1.36;
    return new BoxGeometry(0.3, 0.015, 0.02).translate(0.4, 0.05, 0).rotateY(a);
  });
  const mandibleBoxes = [-1, 1].flatMap((s) => [
    new BoxGeometry(0.16, 0.03, 0.08).translate(0.68, 0.055, s * 0.2),
    new BoxGeometry(0.1, 0.025, 0.06).translate(0.86, 0.05, s * 0.17),
  ]);

  // Cockpit on the starboard side: connecting corridor, tube and tapered canopy.
  const corridor = new BoxGeometry(0.26, 0.06, 0.12).translate(0.22, 0, 0.56);
  const tube = new CylinderGeometry(0.07, 0.07, 0.26, 10).rotateZ(Math.PI / 2).translate(0.38, 0, 0.64);
  const canopy = new CylinderGeometry(0.035, 0.07, 0.12, 10)
    .rotateZ(-Math.PI / 2)
    .translate(0.57, 0, 0.64);
  const canopyFrame = new TorusGeometry(0.05, 0.008, 3, 10).rotateY(Math.PI / 2).translate(0.56, 0, 0.64);

  // Quad-laser turrets top and bottom.
  const turret = (s: number) => [
    new CylinderGeometry(0.075, 0.09, 0.04, 12).translate(0, s * 0.13, 0),
    new SphereGeometry(0.045, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(1, s, 1)
      .translate(0, s * 0.15, 0),
    ...[-1, 1].flatMap((t) =>
      [-1, 1].map((u) =>
        new BoxGeometry(0.15, 0.012, 0.012).translate(0.1, s * (0.155 + u * 0.012), t * 0.028),
      ),
    ),
  ];

  // Rectangular sensor dish on a stalk, top starboard.
  const dishStalk = new CylinderGeometry(0.012, 0.012, 0.1, 4).translate(0.14, 0.15, 0.3);
  const dish = new CylinderGeometry(0.11, 0.11, 0.012, 12)
    .scale(1, 1, 0.75)
    .rotateZ(0.5)
    .translate(0.14, 0.21, 0.3);

  // Docking rings, escape-pod bulges and rim greebles.
  const docks = [-1, 1].map((s) =>
    new CylinderGeometry(0.06, 0.06, 0.08, 8).rotateX(Math.PI / 2).translate(-0.08, 0, s * 0.6),
  );
  const greebles = Array.from({ length: 14 }, (_, i) => {
    const a = Math.PI * 0.35 + (i / 13) * Math.PI * 1.3;
    return new BoxGeometry(0.05, 0.05, 0.08).translate(0.58, 0, 0).rotateY(a);
  });

  return merge([
    slab,
    dome(1),
    dome(-1),
    ...ribs,
    ...mandibleBoxes,
    corridor,
    tube,
    canopy,
    canopyFrame,
    ...turret(1),
    ...turret(-1),
    dishStalk,
    dish,
    ...docks,
    ...greebles,
  ]);
}

/** Sublight engine band across the stern. */
function falconGlow(): BufferGeometry {
  return new CylinderGeometry(0.61, 0.61, 0.05, 24, 1, true, -Math.PI / 2 - 0.85, 1.7);
}

/**
 * WALL-E: compactor body, trapezoid treads, arms with claws, solar strip and a neck carrying
 * the binocular head (separate so it can turn). Front faces +z.
 */
function walleBody(): BufferGeometry {
  const body = new BoxGeometry(0.46, 0.4, 0.42);
  const solar = new BoxGeometry(0.3, 0.1, 0.02).translate(0, 0.08, 0.215);
  const hatch = new BoxGeometry(0.36, 0.2, 0.02).translate(0, -0.08, 0.215);
  const tread = (x: number) =>
    new ExtrudeGeometry(
      shapeOf([
        [0.28, -0.42],
        [-0.3, -0.42],
        [-0.2, -0.06],
        [0.2, -0.06],
      ]),
      { depth: 0.12, bevelEnabled: false },
    )
      .rotateY(Math.PI / 2)
      .translate(x, 0, 0);
  const hubs = [-1, 1].flatMap((s) =>
    [-0.18, 0.18].map((z) =>
      new CylinderGeometry(0.06, 0.06, 0.13, 8)
        .rotateZ(Math.PI / 2)
        .translate(s * 0.3, -0.33, z),
    ),
  );
  const arms = [-1, 1].flatMap((s) => [
    new BoxGeometry(0.06, 0.06, 0.22).translate(s * 0.27, 0, 0.18),
    new BoxGeometry(0.09, 0.03, 0.07).translate(s * 0.27, 0.02, 0.32),
    new BoxGeometry(0.09, 0.03, 0.07).translate(s * 0.27, -0.03, 0.32),
  ]);
  const neck = new CylinderGeometry(0.025, 0.025, 0.24, 6).translate(0, 0.32, -0.02);
  return merge([body, solar, hatch, tread(0.24), tread(-0.36), ...hubs, ...arms, neck]);
}

function walleHead(): BufferGeometry {
  const eyes = [-1, 1].map((s) =>
    new CylinderGeometry(0.085, 0.1, 0.2, 10)
      .rotateX(Math.PI / 2)
      .translate(s * 0.1, 0.5, 0.02),
  );
  const bridge = new BoxGeometry(0.08, 0.04, 0.06).translate(0, 0.47, 0);
  return merge([...eyes, bridge]);
}

function walleLenses(): BufferGeometry {
  return merge(
    [-1, 1].map((s) =>
      new CylinderGeometry(0.065, 0.065, 0.01, 12).rotateX(Math.PI / 2).translate(s * 0.1, 0.5, 0.125),
    ),
  );
}

/**
 * Milano (Guardians of the Galaxy): angular fuselage, forward-swept main wings and canards with
 * dihedral, bubble canopy, tail fin and twin engines. Plan in x / z, nose +x.
 */
function milanoBody(): BufferGeometry {
  const fuselage = plan(
    [
      [0.78, 0],
      [0.3, 0.13],
      [-0.5, 0.15],
      [-0.68, 0.08],
      [-0.68, -0.08],
      [-0.5, -0.15],
      [0.3, -0.13],
    ],
    0.1,
  );
  const wing = (s: number) =>
    plan(
      [
        [-0.48, s * 0.12],
        [-0.15, s * 0.12],
        [0.3, s * 0.74],
        [0.12, s * 0.76],
      ],
      0.03,
    ).rotateX(-s * 0.3);
  const canard = (s: number) =>
    plan(
      [
        [0.18, s * 0.1],
        [0.36, s * 0.1],
        [0.52, s * 0.34],
        [0.42, s * 0.36],
      ],
      0.025,
    ).rotateX(-s * 0.4);
  const canopy = new SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2)
    .scale(2.2, 0.8, 1)
    .translate(0.3, 0.05, 0);
  const fin = new ExtrudeGeometry(
    shapeOf([
      [-0.66, 0.05],
      [-0.35, 0.05],
      [-0.6, 0.24],
      [-0.7, 0.24],
    ]),
    { depth: 0.015, bevelEnabled: false },
  ).translate(0, 0, -0.0075);
  const engines = [-1, 1].map((s) =>
    new CylinderGeometry(0.06, 0.07, 0.26, 8).rotateZ(Math.PI / 2).translate(-0.6, 0, s * 0.09),
  );
  return merge([fuselage, wing(1), wing(-1), canard(1), canard(-1), canopy, fin, ...engines]);
}

/** Twin engine plumes, base at the origin, pointing -x. */
function milanoFlame(): BufferGeometry {
  return merge(
    [-1, 1].map((s) =>
      new ConeGeometry(0.055, 0.32, 8, 1, true)
        .rotateZ(Math.PI / 2)
        .translate(-0.16, 0, s * 0.09),
    ),
  );
}

export interface ShipGeometry {
  body: BufferGeometry;
  edges: BufferGeometry;
  /** Additive glow (engines, flux vents, eye lenses). */
  glow?: BufferGeometry;
  /** Where the glow is mounted, and which local axis stretches with thrust. */
  glowAt?: [number, number, number];
  glowAxis?: 'x' | 'y';
  /** Separately animated part (WALL-E's head); the glow rides on it when `glowOnHead`. */
  head?: { body: BufferGeometry; edges: BufferGeometry };
  glowOnHead?: boolean;
}

export type ShipKind = 'rocket' | 'delorean' | 'falcon' | 'walle' | 'milano';

function ship(body: BufferGeometry, rest: Omit<ShipGeometry, 'body' | 'edges'> = {}): ShipGeometry {
  return { body, edges: new EdgesGeometry(body, 20), ...rest };
}

function buildShips(): Record<ShipKind, ShipGeometry> {
  const head = walleHead();
  return {
    rocket: ship(rocketBody(), { glow: rocketFlame(), glowAt: [0, -0.74, 0], glowAxis: 'y' }),
    delorean: ship(deloreanBody(), { glow: deloreanGlow() }),
    falcon: ship(falconBody(), { glow: falconGlow() }),
    walle: ship(walleBody(), {
      head: { body: head, edges: new EdgesGeometry(head, 20) },
      glow: walleLenses(),
      glowOnHead: true,
    }),
    milano: ship(milanoBody(), { glow: milanoFlame(), glowAt: [-0.73, 0, 0], glowAxis: 'x' }),
  };
}

function disposeShips(ships: Record<ShipKind, ShipGeometry>) {
  Object.values(ships).forEach((s) => {
    [s.body, s.edges, s.glow, s.head?.body, s.head?.edges].forEach((g) => g?.dispose());
  });
}

/** Truncated icosahedron (football): 60 vertices, 12 pentagons, 20 hexagons, 90 edges. */
function footballLines(radius: number): { lines: BufferGeometry; points: BufferGeometry } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const ico: Vector3[] = [];
  for (const a of [-1, 1])
    for (const b of [-phi, phi])
      ico.push(new Vector3(0, a, b), new Vector3(a, b, 0), new Vector3(b, 0, a));
  const neighbours = ico.map((v) =>
    ico.filter((w) => w !== v && Math.abs(v.distanceTo(w) - 2) < 1e-6),
  );
  const point = (v: Vector3, w: Vector3) =>
    v
      .clone()
      .lerp(w, 1 / 3)
      .normalize()
      .multiplyScalar(radius);

  const pos: number[] = [];
  const col: number[] = [];
  const pts: number[] = [];
  const seg = (a: Vector3, b: Vector3, intensity: number) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    col.push(intensity, intensity, intensity, intensity, intensity, intensity);
  };
  ico.forEach((v, i) => {
    const ns = neighbours[i] ?? [];
    ns.forEach((w) => {
      const p = point(v, w);
      pts.push(p.x, p.y, p.z);
      // Hexagon-hexagon edge, drawn once per original edge.
      if (ico.indexOf(w) > i) seg(p, point(w, v), 0.45);
      // Pentagon edges: connect to the cut points of neighbouring neighbours.
      ns.forEach((u) => {
        if (ico.indexOf(u) > ico.indexOf(w) && Math.abs(u.distanceTo(w) - 2) < 1e-6) {
          seg(p, point(v, u), 1);
        }
      });
    });
  });
  const lines = new BufferGeometry();
  lines.setAttribute('position', new Float32BufferAttribute(pos, 3));
  lines.setAttribute('color', new Float32BufferAttribute(col, 3));
  const points = new BufferGeometry();
  points.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return { lines, points };
}

function buildGeometries() {
  const station = stationBody();
  const saucer = saucerBody();
  const football = footballLines(0.75);
  return {
    station,
    stationEdges: new EdgesGeometry(station, 25),
    pod: stationPod(),
    saucer,
    saucerEdges: new EdgesGeometry(saucer, 12),
    dome: new SphereGeometry(0.27, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.13, 0),
    beam: new ConeGeometry(0.55, 1.5, 16, 1, true).translate(0, -0.9, 0),
    ballFill: new IcosahedronGeometry(0.72, 1),
    ballLines: football.lines,
    ballPoints: football.points,
  };
}

export type SpaceGeometries = ReturnType<typeof buildGeometries>;

export interface ColorMaterials {
  fill: MeshBasicMaterial;
  fillHi: MeshBasicMaterial;
  wire: MeshBasicMaterial;
  wireHi: MeshBasicMaterial;
  line: LineBasicMaterial;
  lineHi: LineBasicMaterial;
  /** Line material that multiplies per-vertex intensity (football panels). */
  lineVc: LineBasicMaterial;
  lineVcHi: LineBasicMaterial;
  points: PointsMaterial;
  glass: MeshBasicMaterial;
}

const TOKEN_KEY: Record<
  ColorToken,
  keyof Pick<SceneColors, 'cyan' | 'magenta' | 'green'> | 'amber'
> = {
  cyan: 'cyan',
  magenta: 'magenta',
  green: 'green',
  amber: 'amber',
};
const AMBER = new Color('#ffb020');

export function colorFor(token: ColorToken, colors: SceneColors): Color {
  const key = TOKEN_KEY[token];
  return key === 'amber' ? AMBER : colors[key];
}

function buildMaterials(): ColorMaterials {
  const basic = (opacity: number, extra: Partial<MeshBasicMaterial> = {}) =>
    Object.assign(
      new MeshBasicMaterial({ transparent: true, opacity, depthWrite: false, side: DoubleSide }),
      extra,
    );
  const line = (opacity: number, vertexColors = false) =>
    new LineBasicMaterial({ transparent: true, opacity, vertexColors, depthWrite: false });
  return {
    fill: basic(0.06),
    fillHi: basic(0.16),
    wire: basic(0.6, { wireframe: true }),
    wireHi: basic(1, { wireframe: true }),
    line: line(0.8),
    lineHi: line(1),
    lineVc: line(0.9, true),
    lineVcHi: line(1, true),
    points: new PointsMaterial({
      size: 0.075,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
    glass: basic(0.2),
  };
}

/** Brightness of the highlighted variants relative to the accent colour. */
const HI = 1.7;

function tint(set: ColorMaterials, c: Color) {
  [set.fill, set.wire, set.line, set.lineVc, set.points, set.glass].forEach((m) => m.color.copy(c));
  [set.fillHi, set.wireHi, set.lineHi, set.lineVcHi].forEach((m) =>
    m.color.copy(c).multiplyScalar(HI),
  );
}

/** Ref-counted shared assets: built on first use, disposed when the last user releases them. */
let shared: {
  geo: SpaceGeometries;
  ships: Record<ShipKind, ShipGeometry>;
  mats: Map<ColorToken, ColorMaterials>;
  users: number;
} | null = null;

export function acquireAssets() {
  if (!shared) shared = { geo: buildGeometries(), ships: buildShips(), mats: new Map(), users: 0 };
  shared.users++;
  return shared;
}

export function materialsFor(token: ColorToken, colors: SceneColors): ColorMaterials {
  const s = shared ?? acquireAssets();
  let set = s.mats.get(token);
  if (!set) {
    set = buildMaterials();
    s.mats.set(token, set);
  }
  tint(set, colorFor(token, colors));
  return set;
}

export function retintAll(colors: SceneColors): void {
  shared?.mats.forEach((set, token) => tint(set, colorFor(token, colors)));
}

export function releaseAssets(): void {
  if (!shared || --shared.users > 0) return;
  Object.values(shared.geo).forEach((g) => g.dispose());
  disposeShips(shared.ships);
  shared.mats.forEach((set) => Object.values(set).forEach((m: Material) => m.dispose()));
  shared = null;
}

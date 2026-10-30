import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Color, Group } from 'three';
import type { SceneColors } from './colors';

type ShapeKind =
  'icosahedron' | 'torusKnot' | 'octahedron' | 'dodecahedron' | 'torus' | 'tetrahedron';

interface ShapeDef {
  kind: ShapeKind;
  position: [number, number, number];
  scale: number;
  color: keyof Pick<SceneColors, 'cyan' | 'magenta' | 'green'>;
  speed: number;
}

/**
 * Wireframe "artifacts" floating above the terrain. Each sits near one panel's camera target
 * (see sectionPresets.lookAt), so switching panels frames a different object.
 */
const SHAPES: ShapeDef[] = [
  { kind: 'icosahedron', position: [-6, 1.6, -6], scale: 1.1, color: 'magenta', speed: 0.25 }, // about
  { kind: 'torusKnot', position: [7, 1.4, -8], scale: 0.8, color: 'cyan', speed: 0.3 }, // projects
  { kind: 'octahedron', position: [0, 5.2, -12], scale: 1.4, color: 'green', speed: 0.2 }, // research
  { kind: 'dodecahedron', position: [-8, 0.8, -14], scale: 1.3, color: 'magenta', speed: 0.18 }, // experience
  { kind: 'torus', position: [8, 3, -14], scale: 1.3, color: 'green', speed: 0.22 }, // skills
  { kind: 'tetrahedron', position: [0, 2.4, -16], scale: 1.5, color: 'cyan', speed: 0.15 }, // contact
];

function Geometry({ kind }: { kind: ShapeKind }) {
  switch (kind) {
    case 'icosahedron':
      return <icosahedronGeometry args={[1, 1]} />;
    case 'torusKnot':
      return <torusKnotGeometry args={[0.9, 0.28, 90, 10]} />;
    case 'octahedron':
      return <octahedronGeometry args={[1, 0]} />;
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1, 0]} />;
    case 'torus':
      return <torusGeometry args={[1, 0.3, 10, 36]} />;
    case 'tetrahedron':
      return <tetrahedronGeometry args={[1, 0]} />;
  }
}

function Shape({ def, color, animate }: { def: ShapeDef; color: Color; animate: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g || !animate) return;
    const t = clock.getElapsedTime() * def.speed;
    g.rotation.x = t * 0.7;
    g.rotation.y = t;
    g.position.y = def.position[1] + Math.sin(t * 2) * 0.25;
  });
  return (
    <group ref={ref} position={def.position} scale={def.scale}>
      <mesh>
        <Geometry kind={def.kind} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

export function FloatingShapes({
  colors,
  animate,
  count,
}: {
  colors: SceneColors;
  animate: boolean;
  count: number;
}) {
  return (
    <>
      {SHAPES.slice(0, count).map((def) => (
        <Shape key={def.kind} def={def} color={colors[def.color]} animate={animate} />
      ))}
    </>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  CanvasTexture,
  LinearFilter,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Group,
  type Sprite,
  type SpriteMaterial,
} from 'three';
import { usePageVisible } from '../hooks/usePageVisible';
import { readThemeColors } from './colors';

const RADIUS = 3.6;
const CAMERA_Z = 9;
const tmp = new Vector3();

interface Props {
  skills: string[];
  reducedMotion: boolean;
}

/** Render a label to a canvas texture (self-hosted font, no external requests). */
function makeLabel(text: string, color: string) {
  const fontSize = 44;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
  const width = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.width = width;
  canvas.height = fontSize + 20;
  ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 12, canvas.height / 2);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return { texture, aspect: canvas.width / canvas.height };
}

function Labels({ skills, animate }: { skills: string[]; animate: boolean }) {
  const group = useRef<Group>(null);

  const labels = useMemo(() => {
    const colors = readThemeColors();
    const palette = [colors.cyan, colors.magenta, colors.green].map((c) => `#${c.getHexString()}`);
    const n = skills.length;
    const radius = RADIUS;
    return skills.map((skill, i) => {
      // Fibonacci sphere distribution for even spacing.
      const y = 1 - (i / Math.max(n - 1, 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      const { texture, aspect } = makeLabel(skill, palette[i % palette.length] as string);
      return {
        skill,
        texture,
        aspect,
        position: [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius] as [
          number,
          number,
          number,
        ],
      };
    });
  }, [skills]);

  // Textures are created imperatively, so dispose them ourselves.
  useEffect(() => () => labels.forEach((l) => l.texture.dispose()), [labels]);

  useFrame(({ camera }, delta) => {
    const g = group.current;
    if (!g) return;
    if (animate) g.rotation.y += Math.min(delta, 0.1) * 0.15;
    // Fade labels on the far side of the sphere for depth and legibility.
    g.children.forEach((child) => {
      child.getWorldPosition(tmp);
      const depth = tmp.distanceTo(camera.position);
      const material = (child as Sprite).material as SpriteMaterial;
      material.opacity = MathUtils.mapLinear(depth, CAMERA_Z - RADIUS, CAMERA_Z + RADIUS, 1, 0.15);
    });
  });

  return (
    <group ref={group}>
      {labels.map((l) => (
        <sprite key={l.skill} position={l.position} scale={[0.24 * l.aspect, 0.24, 1]}>
          <spriteMaterial map={l.texture} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

/** Interactive rotating skill sphere (lazy-loaded, drag to rotate). */
export default function SkillSphere({ skills, reducedMotion }: Props) {
  const visible = usePageVisible();
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && setFontReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!fontReady) return null;

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={visible ? (reducedMotion ? 'demand' : 'always') : 'never'}
      camera={{ position: [0, 0, CAMERA_Z], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <Labels skills={skills} animate={!reducedMotion} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}

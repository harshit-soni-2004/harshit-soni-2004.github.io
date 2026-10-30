import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Color, Points } from 'three';

interface Props {
  count: number;
  color: Color;
  animate: boolean;
}

/** Slowly drifting neon dust above the terrain. */
export function Particles({ count, color, animate }: Props) {
  const ref = useRef<Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = Math.random() * 12 - 1;
      arr[i * 3 + 2] = -Math.random() * 40 + 6;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += Math.min(delta, 0.1) * 0.01;
    ref.current.position.y = Math.sin(performance.now() / 6000) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </points>
  );
}

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending } from 'three';
import type { SceneColors } from './colors';
import { activeSection } from './activeSection';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Synthwave sun: vertical gradient disc with horizontal slats that scroll downwards.
const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float edge = smoothstep(0.5, 0.47, r);
    float y = vUv.y;
    // Slats only on the lower half; they get thicker toward the bottom.
    float band = fract(y * 14.0 + uTime * 0.15);
    float thickness = mix(0.0, 0.55, smoothstep(0.55, 0.0, y));
    float slat = step(thickness, band);
    vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, y));
    gl_FragColor = vec4(col * 0.55, edge * slat * 0.85);
  }
`;

/** Glowing sun on the horizon; colour follows the active panel's tint. */
export function Sun({ colors, animate }: { colors: SceneColors; animate: boolean }) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: colors.magenta.clone() },
      uBottom: { value: colors.cyan.clone() },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const tint = colors.tints[activeSection()];
    const t = animate ? 1 - Math.pow(0.05, Math.min(delta, 0.1)) : 1;
    uniforms.uTop.value.lerp(tint.b, t);
    uniforms.uBottom.value.lerp(tint.a, t);
    if (animate) uniforms.uTime.value += Math.min(delta, 0.1);
  });

  return (
    <mesh position={[0, 3.5, -46]}>
      <planeGeometry args={[22, 22]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
}

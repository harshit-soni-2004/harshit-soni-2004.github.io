import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Plane, Raycaster, Vector2, Vector3, Vector4, type Camera } from 'three';
import { terrainShape as shape } from '../config/theme';
import type { SceneColors } from './colors';
import { activeSection } from './activeSection';
import { motion } from './motion';
import { decaySeconds, pointerField } from './pointerField';

const TERRAIN_Y = -2.2;
const TERRAIN_Z = -8;
const SIZE: [number, number] = [64, 52];

const vertexShader = /* glsl */ `
  #define TRAIL ${shape.maxTrail}
  #define WAVES ${shape.wave.max}

  uniform float uTime;
  uniform float uAmp;
  // Fluid pointer interaction (all positions in the plane's local x/y, i.e. world units).
  uniform float uFluid;
  uniform float uClock;
  uniform vec3 uPointer;        // x, y, presence 0..1
  uniform vec4 uTrail[TRAIL];   // x, y, birth time (< 0 = empty slot), strength
  uniform int uTrailCount;
  uniform vec3 uWaves[WAVES];   // x, y, start time (< 0 = empty slot)
  uniform float uLiftAmp;
  uniform float uRadius;
  uniform float uDecay;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  uniform float uWaveWidth;
  uniform float uWaveLife;
  varying float vHeight;
  varying float vDepth;
  varying float vLift;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float gauss(vec2 d, float r) { return exp(-dot(d, d) / (r * r)); }

  // Normalised lift (0 = flat, ~1 = full bump) from the pointer, its trail and click waves.
  float fluidLift(vec2 p) {
    float lift = gauss(p - uPointer.xy, uRadius) * uPointer.z;

    float trail = 0.0;
    for (int i = 0; i < TRAIL; i++) {
      if (i >= uTrailCount) break;
      vec4 s = uTrail[i];
      float age = uClock - s.z;
      if (s.z < 0.0 || age > uDecay) continue;
      float f = 1.0 - age / uDecay;
      f = f * f * (3.0 - 2.0 * f);
      vec2 d = p - s.xy;
      // Gaussian bump with a travelling ripple so strokes leave a wake.
      trail += gauss(d, uRadius * 0.7) * f * s.w * (0.7 + 0.3 * cos(length(d) * 2.6 - age * 9.0));
    }
    lift += min(trail * 0.35, 1.0);
    lift = min(lift, 1.5);

    for (int i = 0; i < WAVES; i++) {
      vec3 w = uWaves[i];
      float age = uClock - w.z;
      if (w.z < 0.0 || age > uWaveLife) continue;
      float ring = (length(p - w.xy) - age * uWaveSpeed) / uWaveWidth;
      float fade = 1.0 - age / uWaveLife;
      lift += exp(-ring * ring) * fade * fade * uWaveAmp / max(uLiftAmp, 0.05);
    }
    return lift;
  }

  void main() {
    vec3 pos = position;
    // Scroll the noise field along the plane so the terrain appears to flow towards the camera.
    vec2 p = pos.xy * 0.16 + vec2(0.0, uTime * 0.22);
    float h = noise(p) * 0.7 + noise(p * 2.3) * 0.3;
    // Keep a flatter valley down the middle so foreground panels stay readable.
    float valley = smoothstep(1.0, 10.0, abs(pos.x));
    pos.z = h * uAmp * (0.2 + valley);

    vLift = 0.0;
    if (uFluid > 0.5) {
      vLift = fluidLift(pos.xy);
      pos.z += vLift * uLiftAmp;
    }

    vHeight = h;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uHoverA;
  uniform vec3 uHoverB;
  uniform float uHoverGlow;
  uniform float uHoverMix;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uGlow;
  varying float vHeight;
  varying float vDepth;
  varying float vLift;

  void main() {
    vec3 col = mix(uColorA, uColorB, smoothstep(0.35, 0.85, vHeight)) * uGlow;
    // Near the pointer lines shift cyan -> magenta towards the centre and brighten.
    float k = clamp(vLift, 0.0, 1.0) * uHoverMix;
    vec3 hover = mix(uHoverA, uHoverB, smoothstep(0.2, 0.9, k)) * uGlow * (1.0 + uHoverGlow * k);
    col = mix(col, hover, smoothstep(0.0, 0.5, k));
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
  }
`;

interface Props {
  segments: number;
  colors: SceneColors;
  /** Brighten lines when bloom is off (cheap glow fallback). */
  boost: boolean;
  animate: boolean;
  /** Device allows the mouse effect (fine pointer, not low-power, motion allowed). */
  interactive: boolean;
}

const emptyVec3 = (n: number) => Array.from({ length: n }, () => new Vector3(0, 0, -1));
const emptyVec4 = (n: number) => Array.from({ length: n }, () => new Vector4(0, 0, -1, 0));

/** Wireframe terrain displaced on the GPU; one draw call. Tint follows the active panel. */
export function Terrain({ segments, colors, boost, animate, interactive }: Props) {
  const mesh = useRef<Mesh>(null);
  // Uniforms are created once; values are updated in place.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 2.6 },
      uColorA: { value: colors.cyan.clone() },
      uColorB: { value: colors.magenta.clone() },
      uHoverA: { value: colors.cyan.clone() },
      uHoverB: { value: colors.magenta.clone() },
      uHoverGlow: { value: shape.glow },
      uHoverMix: { value: 1 },
      uFogColor: { value: colors.bg.clone() },
      uFogNear: { value: 6 },
      uFogFar: { value: 34 },
      uGlow: { value: 1 },
      uFluid: { value: 0 },
      uClock: { value: 0 },
      uPointer: { value: new Vector3() },
      uTrail: { value: emptyVec4(shape.maxTrail) },
      uTrailCount: { value: 0 },
      uWaves: { value: emptyVec3(shape.wave.max) },
      uLiftAmp: { value: 0 },
      uRadius: { value: 1 },
      uDecay: { value: 1 },
      uWaveAmp: { value: 0 },
      uWaveSpeed: { value: shape.wave.speed },
      uWaveWidth: { value: shape.wave.width },
      uWaveLife: { value: shape.wave.life },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Scratch objects and tracking state, reused every frame (no per-frame allocation).
  const tracker = useMemo(
    () => ({
      raycaster: new Raycaster(),
      plane: new Plane(new Vector3(0, 1, 0), -TERRAIN_Y),
      ndc: new Vector2(),
      scratch: new Vector2(),
      hit: new Vector3(),
      target: new Vector3(),
      trailIndex: 0,
      trailCount: 0,
      waveIndex: 0,
      lastSampleAt: 0,
      lastSample: new Vector2(Infinity, Infinity),
    }),
    [],
  );

  // Kept deliberately dim so text stays readable on top; bloom adds the glow.
  const baseGlow = boost ? 0.8 : 0.55;

  useEffect(() => {
    uniforms.uFogColor.value.copy(colors.bg);
    uniforms.uHoverA.value.copy(colors.cyan);
    uniforms.uHoverB.value.copy(colors.magenta);
  }, [colors, uniforms]);

  useEffect(() => {
    uniforms.uFluid.value = interactive ? 1 : 0;
    if (interactive) return;
    uniforms.uPointer.value.z = 0;
    uniforms.uTrail.value.forEach((s) => (s.z = -1));
    uniforms.uWaves.value.forEach((s) => (s.z = -1));
    motion.clicks.length = 0;
  }, [interactive, uniforms]);

  /** Project an NDC point onto the terrain plane; writes local x/y into `out`. */
  const project = (x: number, y: number, camera: Camera, out: Vector3) => {
    const m = mesh.current;
    if (!m) return false;
    tracker.ndc.set(x, y);
    tracker.raycaster.setFromCamera(tracker.ndc, camera);
    if (!tracker.raycaster.ray.intersectPlane(tracker.plane, out)) return false;
    m.worldToLocal(out);
    return Math.abs(out.x) < SIZE[0] / 2 && Math.abs(out.y) < SIZE[1] / 2;
  };

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const tint = colors.tints[activeSection()];
    if (animate) {
      const t = 1 - Math.pow(0.05, dt);
      uniforms.uColorA.value.lerp(tint.a, t);
      uniforms.uColorB.value.lerp(tint.b, t);
      motion.pulse *= Math.pow(0.15, dt);
      uniforms.uTime.value += dt * (1 + motion.pulse * 2);
    } else {
      uniforms.uColorA.value.copy(tint.a);
      uniforms.uColorB.value.copy(tint.b);
    }
    uniforms.uGlow.value = baseGlow * (1 + Math.min(motion.pulse, 1) * 0.6);

    if (!interactive) return;
    const f = pointerField;
    const cfg = f.config;
    const now = clock.elapsedTime;
    uniforms.uClock.value = now;
    uniforms.uLiftAmp.value = cfg.amplitude * f.damping;
    uniforms.uRadius.value = cfg.radius;
    uniforms.uDecay.value = decaySeconds(cfg.decay);
    uniforms.uWaveAmp.value = shape.wave.amplitude * cfg.clickWaveStrength * f.damping;
    uniforms.uHoverMix.value = Math.min(1, 0.45 + cfg.amplitude * 0.6) * f.damping;

    const trailLength = Math.max(0, Math.min(cfg.trailLength, shape.maxTrail));
    if (trailLength !== tracker.trailCount) {
      tracker.trailCount = trailLength;
      tracker.trailIndex = 0;
      uniforms.uTrail.value.forEach((s) => (s.z = -1));
    }
    uniforms.uTrailCount.value = trailLength;

    // The bump follows the smoothed pointer; its strength is the pointer field's presence.
    const pointer = uniforms.uPointer.value;
    const onTerrain = f.presence > 0 && project(f.x, f.y, camera, tracker.hit);
    if (onTerrain) pointer.set(tracker.hit.x, tracker.hit.y, f.presence);
    else pointer.z = Math.min(pointer.z, f.presence);

    // Trail history: throttled by time and distance; strength follows the capped speed.
    const nowMs = now * 1000;
    if (
      onTerrain &&
      f.active &&
      trailLength > 0 &&
      nowMs - tracker.lastSampleAt >= shape.trailInterval &&
      tracker.lastSample.distanceTo(tracker.scratch.set(tracker.hit.x, tracker.hit.y)) >=
        shape.trailSpacing
    ) {
      uniforms.uTrail.value[tracker.trailIndex]?.set(
        tracker.hit.x,
        tracker.hit.y,
        now,
        0.35 + 0.65 * f.speed,
      );
      tracker.trailIndex = (tracker.trailIndex + 1) % trailLength;
      tracker.lastSampleAt = nowMs;
      tracker.lastSample.set(tracker.hit.x, tracker.hit.y);
    }

    // Click shockwaves.
    while (motion.clicks.length) {
      const click = motion.clicks.shift();
      if (!click || !f.active || !cfg.clickWave) continue;
      if (project(click.x, click.y, camera, tracker.target)) {
        uniforms.uWaves.value[tracker.waveIndex]?.set(tracker.target.x, tracker.target.y, now);
        tracker.waveIndex = (tracker.waveIndex + 1) % shape.wave.max;
      }
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, TERRAIN_Y, TERRAIN_Z]}>
      {/* Geometry and material are declared in JSX so R3F disposes them on unmount. */}
      <planeGeometry args={[SIZE[0], SIZE[1], segments, Math.round(segments * 0.8)]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
      />
    </mesh>
  );
}

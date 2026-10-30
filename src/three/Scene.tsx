import { lazy, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { sceneQuality } from '../config/theme';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePageVisible } from '../hooks/usePageVisible';
import { useStore } from '../state/store';
import { CameraRig } from './CameraRig';
import { readThemeColors } from './colors';
import { Effects } from './Effects';
import { FloatingShapes } from './FloatingShapes';
import { FrameDriver } from './FrameDriver';
import { attachMotionListeners } from './motion';
import { Particles } from './Particles';
import { PointerFieldDriver } from './pointerField';

// Interactive space objects load as their own chunk after the scene is up.
const SpaceObjects = lazy(() => import('./space/SpaceObjects'));
import { Sun } from './Sun';
import { Terrain } from './Terrain';

interface Props {
  bloom: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
  /** Changes when the palette changes, so colours are re-read from CSS. */
  paletteKey: string;
}

/** With frameloop="demand" and no FrameDriver (reduced motion), re-render on panel changes. */
function InvalidateOnPanelChange() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        if (s.route.section !== prev.route.section) invalidate();
      }),
    [invalidate],
  );
  return null;
}

/**
 * Background scene (lazy-loaded chunk).
 * - frameloop "demand" + FrameDriver caps FPS; "never" while the tab is hidden.
 * - reduced motion: static frame per panel (camera snaps to the preset, no flow or parallax).
 * - DPR capped at 2 (1.25 on low-power devices).
 */
export default function Scene({ bloom, reducedMotion, lowPower, paletteKey }: Props) {
  const visible = usePageVisible();
  const quality = lowPower ? sceneQuality.low : sceneQuality.high;
  const colors = useMemo(readThemeColors, [paletteKey]);
  const animate = !reducedMotion;
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const interactive = animate && !lowPower && finePointer;
  const playground = useStore((s) => s.playground);

  useEffect(() => attachMotionListeners(), []);

  return (
    <Canvas
      dpr={[1, quality.maxDpr]}
      frameloop={visible ? 'demand' : 'never'}
      camera={{ position: [0, 1.6, 8], fov: 60, near: 0.1, far: 80 }}
      gl={{
        antialias: !lowPower && !bloom,
        powerPreference: lowPower ? 'low-power' : 'high-performance',
        alpha: false,
        stencil: false,
      }}
      style={{
        pointerEvents: playground ? 'auto' : 'none',
        touchAction: playground ? 'none' : 'auto',
      }}
      onCreated={({ camera }) => camera.lookAt(0, -0.5, -10)}
    >
      <PointerFieldDriver allowed={interactive} />
      <color attach="background" args={[colors.bg]} />
      <fog attach="fog" args={[colors.bg, 6, 34]} />
      {quality.sun && <Sun colors={colors} animate={animate} />}
      <Terrain
        segments={quality.segments}
        colors={colors}
        boost={!bloom}
        animate={animate}
        interactive={interactive}
      />
      <FloatingShapes colors={colors} animate={animate} count={quality.shapes} />
      <Particles count={quality.particles} color={colors.cyan} animate={animate} />
      <Suspense fallback={null}>
        <SpaceObjects
          colors={colors}
          animate={animate}
          lowPower={lowPower}
          playground={playground}
        />
      </Suspense>
      <CameraRig enabled={animate} />
      {bloom && <Effects />}
      <InvalidateOnPanelChange />
      <FrameDriver fps={quality.fps} active={visible && animate} />
    </Canvas>
  );
}

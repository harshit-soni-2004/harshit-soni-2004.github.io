import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { sectionPresets } from '../config/theme';
import { activeSection } from './activeSection';
import { pointerField } from './pointerField';

/** World offset per unit of `parallaxStrength` (0.45 reproduces the original 0.6 / 0.25 tilt). */
const PARALLAX_X = 1.33;
const PARALLAX_Y = 0.55;

/**
 * Moves the camera to the active panel's preset (smooth, frame-rate independent lerp) and adds
 * a gentle pointer parallax on top. With motion disabled the camera snaps to the preset.
 */
export function CameraRig({ enabled }: { enabled: boolean }) {
  const target = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(0, -0.5, -10), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const parallaxRef = useRef(0);

  useFrame(({ camera, invalidate }, delta) => {
    const preset = sectionPresets[activeSection()];
    target.set(...preset.camera);
    lookTarget.set(...preset.lookAt);

    if (!enabled) {
      // Reduced motion: jump straight to the preset, no parallax.
      if (camera.position.distanceToSquared(target) > 1e-4) {
        camera.position.copy(target);
        look.copy(lookTarget);
        camera.lookAt(look);
        invalidate();
      }
      return;
    }

    const t = 1 - Math.pow(0.04, Math.min(delta, 0.1));
    // Parallax follows the smoothed pointer; calmer over text panels, none with `fx off`.
    const f = pointerField;
    const goal = f.active ? f.config.parallaxStrength * f.damping : 0;
    parallaxRef.current += (goal - parallaxRef.current) * t;
    target.x += f.x * parallaxRef.current * PARALLAX_X;
    target.y += f.y * parallaxRef.current * PARALLAX_Y;
    camera.position.lerp(target, t);
    look.lerp(lookTarget, t);
    camera.lookAt(look);
  });
  return null;
}

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * The Canvas runs with frameloop="demand"; this component requests frames at a capped rate.
 * Lets us run 60fps on desktops, 30fps on low-power devices, and stop entirely when inactive.
 */
export function FrameDriver({ fps, active }: { fps: number; active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!active) return;
    const interval = 1000 / fps;
    let last = 0;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last >= interval - 1) {
        last = now;
        invalidate();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fps, active, invalidate]);

  return null;
}

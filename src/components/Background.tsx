import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { hasWebGL } from '../hooks/useWebGLSupport';
import { useStore } from '../state/store';
import styles from './Background.module.css';

// Three.js + R3F live in a separate chunk, loaded only after first paint.
const Scene = lazy(() => import('../three/Scene'));

interface Props {
  enabled: boolean;
  bloom: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
  paletteKey: string;
}

/** If WebGL throws (context lost, driver issues), fall back to the CSS background. */
class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[background] 3D scene disabled:', error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed full-screen background. A CSS gradient + perspective grid is always rendered
 * underneath, so content stays readable if WebGL is unavailable or disabled.
 */
export function Background({ enabled, bloom, reducedMotion, lowPower, paletteKey }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const playground = useStore((s) => s.playground);

  // Defer loading the 3D chunk until the browser is idle after first paint.
  useEffect(() => {
    if (!enabled || ready) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, [enabled, ready]);

  const show3d = enabled && ready && !failed && hasWebGL();

  return (
    <div
      className={`${styles.root} ${playground && show3d ? styles.playground : ''}`}
      aria-hidden="true"
    >
      <div className={styles.fallback}>
        <div className={styles.grid} />
      </div>
      {show3d && (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <Scene
              bloom={bloom && !lowPower}
              reducedMotion={reducedMotion}
              lowPower={lowPower}
              paletteKey={paletteKey}
            />
          </Suspense>
        </SceneBoundary>
      )}
      <div className={styles.scrim} />
    </div>
  );
}

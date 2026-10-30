import { useEffect, useRef, useState, type ElementType } from 'react';
import styles from './GlitchText.module.css';

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  /** Play a short glitch once when the element first enters the viewport. */
  glitchOnView?: boolean;
}

/**
 * RGB-split glitch heading. Pure CSS: two pseudo-element copies (cyan / magenta) are
 * clipped and offset on hover and once on load. Disabled globally via `html.fx-glitch-off`
 * (FX toggle or prefers-reduced-motion).
 */
export function GlitchText({ text, as: Tag = 'span', className, id, glitchOnView = true }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!glitchOnView || !ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [glitchOnView]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={[styles.glitch, playing ? styles.once : '', className ?? ''].join(' ')}
      data-text={text}
      onAnimationEnd={() => setPlaying(false)}
    >
      {text}
    </Tag>
  );
}

import { useEffect, useRef, type TouchEvent } from 'react';
import { navigateTo, setPlayground, spaceInput, stepSection, useStore } from '../state/store';
import { SECTION_IDS, type SectionId } from '../terminal/types';

function isTypingTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  return (
    t.tagName === 'INPUT' ||
    t.tagName === 'TEXTAREA' ||
    t.tagName === 'SELECT' ||
    t.isContentEditable
  );
}

/**
 * Keyboard panel switching: 0-6 jump, ←/→ and k/j step; P toggles playground mode, Esc leaves it.
 * Ignored while typing or in a dialog.
 */
export function usePanelKeys(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPlayground(!useStore.getState().playground);
        return;
      }
      if (e.key === 'Escape' && useStore.getState().playground) {
        e.preventDefault();
        setPlayground(false);
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        const section = SECTION_IDS[Number(e.key)];
        if (section) {
          e.preventDefault();
          navigateTo(section as SectionId);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'j') {
        e.preventDefault();
        stepSection(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        e.preventDefault();
        stepSection(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** True if `el` (or an ancestor inside `root`) can scroll horizontally itself. */
function inHorizontalScroller(el: Element | null, root: Element): boolean {
  for (let n = el; n && n !== root; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 2) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
  }
  return false;
}

/** Horizontal swipe → previous / next panel. Vertical scrolling inside panels is unaffected. */
export function useSwipeNavigation() {
  const start = useRef<{ x: number; y: number; t: number; skip: boolean } | null>(null);

  return {
    onTouchStart: (e: TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      if (!touch || e.touches.length > 1) return;
      start.current = {
        x: touch.clientX,
        y: touch.clientY,
        t: Date.now(),
        skip: spaceInput.dragging || inHorizontalScroller(e.target as Element, e.currentTarget),
      };
    },
    onTouchEnd: (e: TouchEvent<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      const touch = e.changedTouches[0];
      if (!s || s.skip || spaceInput.dragging || !touch) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const dx = touch.clientX - s.x;
      const dy = touch.clientY - s.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - s.t < 800) {
        stepSection(dx < 0 ? 1 : -1);
      }
    },
  };
}

import { useEffect, useState } from 'react';

interface Props {
  text: string;
  label: string;
  className?: string;
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Copies text to the clipboard and announces the result. */
export function CopyButton({ text, label, className = 'btn btn--ghost btn--sm' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const t = window.setTimeout(() => setState('idle'), 1800);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => setState((await copy(text)) ? 'copied' : 'failed')}
    >
      <span aria-live="polite">
        {state === 'copied' ? '✓ copied' : state === 'failed' ? 'copy failed' : label}
      </span>
    </button>
  );
}

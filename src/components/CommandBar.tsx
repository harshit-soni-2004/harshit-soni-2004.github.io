import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { profile } from '../data';
import { PALETTE_NAMES, useRunCommand } from '../hooks/useTerminal';
import { setPlayground, useStore } from '../state/store';
import { autocomplete } from '../terminal/autocomplete';
import { siteContent } from '../terminal/content';
import type { SectionId } from '../terminal/types';
import { SettingsMenu } from './SettingsMenu';
import { TerminalPane } from './TerminalPane';
import styles from './CommandBar.module.css';

const NAV = ['about', 'projects', 'research', 'experience', 'skills', 'contact'] as const;

/**
 * Persistent prompt bar: clickable `./section` commands for mouse/touch users and a real
 * command input (Tab autocomplete, ↑/↓ history, "/" or Ctrl+K to focus, Esc to close).
 */
export function CommandBar({ active }: { active: SectionId }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const run = useRunCommand();
  const open = useStore((s) => s.terminalOpen);
  const setOpen = useStore((s) => s.setTerminalOpen);
  const pushLines = useStore((s) => s.pushLines);
  const playground = useStore((s) => s.playground);

  // Global shortcuts: "/" or Ctrl/Cmd+K focus the command input.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = () => {
    const input = value.trim();
    setValue('');
    setHistoryIndex(null);
    if (input) run(input);
    else setOpen(true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const history = useStore.getState().history;
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        submit();
        break;
      case 'Tab': {
        // Empty input: let Tab move focus normally (keyboard accessibility).
        if (!value || e.shiftKey) return;
        e.preventDefault();
        const res = autocomplete(value, siteContent, { palettes: PALETTE_NAMES });
        setValue(res.value);
        if (res.options.length > 1) {
          pushLines([{ kind: 'muted', text: res.options.join('   ') }]);
          setOpen(true);
        }
        break;
      }
      case 'ArrowUp': {
        if (history.length === 0) return;
        e.preventDefault();
        const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(next);
        setValue(history[next] ?? '');
        break;
      }
      case 'ArrowDown': {
        if (historyIndex === null) return;
        e.preventDefault();
        const next = historyIndex + 1;
        if (next >= history.length) {
          setHistoryIndex(null);
          setValue('');
        } else {
          setHistoryIndex(next);
          setValue(history[next] ?? '');
        }
        break;
      }
      case 'Escape':
        setOpen(false);
        inputRef.current?.blur();
        break;
      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          useStore.getState().clearLines();
        }
        break;
    }
  };

  return (
    <header className={styles.header} data-occluder>
      <div className={styles.row}>
        <a className={styles.prompt} href="#/" aria-label={`${profile.name} — back to top`}>
          <span className={styles.user}>{profile.handle}@portfolio</span>
          <span className={styles.sep}>:</span>
          <span className={styles.path}>~</span>
          <span className={styles.sep}>$</span>
        </a>

        <form
          className={styles.form}
          role="search"
          aria-label="Terminal"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label htmlFor="cmd-input" className="visually-hidden">
            Terminal command. Type help for a list of commands.
          </label>
          <input
            ref={inputRef}
            id="cmd-input"
            className={styles.input}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setHistoryIndex(null);
            }}
            onKeyDown={onKeyDown}
            placeholder="type 'help'…"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-controls="terminal-output"
            aria-expanded={open}
          />
          <kbd className={styles.kbd} aria-hidden="true">
            /
          </kbd>
        </form>

        <button
          type="button"
          className={styles.iconBtn}
          aria-label={open ? 'Hide terminal output' : 'Show terminal output'}
          aria-expanded={open}
          aria-controls="terminal-output"
          onClick={() => setOpen(!open)}
        >
          {open ? '▾' : '▸'}_
        </button>
        <SettingsMenu />
      </div>

      <nav className={styles.nav} aria-label="Primary">
        <ul>
          {NAV.map((id) => (
            <li key={id}>
              <a
                href={`#/${id}`}
                className={active === id ? styles.active : undefined}
                aria-current={active === id ? 'page' : undefined}
              >
                ./{id}
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={styles.play}
              aria-pressed={playground}
              aria-keyshortcuts="P"
              title="Playground mode (P)"
              onClick={() => setPlayground(!playground)}
            >
              <span aria-hidden="true">{playground ? '■' : '▶'}</span>{' '}
              {playground ? './exit' : './play'}
            </button>
          </li>
        </ul>
      </nav>

      <TerminalPane onClose={() => setOpen(false)} />
    </header>
  );
}

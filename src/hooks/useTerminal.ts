import { useCallback } from 'react';
import { palettes, spaceObjects } from '../config/theme';
import { asset } from '../config/site';
import {
  KIND_SECTION,
  navigateTo,
  sendSpaceCommand,
  setPlayground,
  spaceQueue,
  useStore,
} from '../state/store';
import { executeCommand } from '../terminal/commands';
import { siteContent } from '../terminal/content';
import type { TerminalAction, TerminalEnv } from '../terminal/types';

export const PALETTE_NAMES = Object.keys(palettes);

export function useTerminalEnv(): TerminalEnv {
  const effects = useStore((s) => s.effects);
  const palette = useStore((s) => s.palette);
  const history = useStore((s) => s.history);
  const pointerMode = useStore((s) => s.pointerMode);
  const playground = useStore((s) => s.playground);
  const count = useStore((s) => s.spaceInstances.length);
  return {
    effects,
    palette,
    palettes: PALETTE_NAMES,
    history,
    pointerMode,
    playground,
    space: { count, max: spaceObjects.maxObjects },
  };
}

function download(path: string) {
  const a = document.createElement('a');
  a.href = asset(path);
  a.download = path.split('/').pop() ?? 'resume.pdf';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Runs a command line: echoes it, executes the pure command, then performs its actions. */
export function useRunCommand() {
  const env = useTerminalEnv();
  const { handle } = siteContent.profile;

  return useCallback(
    (input: string) => {
      const s = useStore.getState();
      s.pushHistory(input);
      s.pushLines([{ kind: 'input', text: `${handle}@portfolio:~$ ${input}` }]);
      // Count queued spawns too: the 3D layer only applies them on its next frame.
      const pendingSpawns = spaceQueue.filter((c) => c.type === 'spawn').length;
      const res = executeCommand(input, siteContent, {
        ...env,
        history: [...s.history, input],
        space: { count: s.spaceInstances.length + pendingSpawns, max: spaceObjects.maxObjects },
      });
      s.pushLines(res.lines);

      let keepOpen = res.lines.length > 0;
      res.actions.forEach((action: TerminalAction) => {
        switch (action.type) {
          case 'navigate':
            navigateTo(action.section);
            break;
          case 'open':
            keepOpen = false;
            navigateTo(KIND_SECTION[action.kind], action.id);
            break;
          case 'filter':
            s.setProjectFilter({ tag: action.tag, search: action.search });
            break;
          case 'clear':
            s.clearLines();
            keepOpen = true;
            break;
          case 'download':
            download(action.path);
            break;
          case 'set-effect':
            s.setEffect(action.effect, action.value);
            break;
          case 'set-palette':
            s.setPalette(action.palette);
            break;
          case 'set-pointer-mode':
            s.setPointerMode(action.mode);
            break;
          case 'playground':
            setPlayground(action.value);
            if (action.value) keepOpen = false;
            break;
          case 'space':
            sendSpaceCommand(action.command);
            break;
        }
      });
      s.setTerminalOpen(keepOpen);
    },
    [env, handle],
  );
}

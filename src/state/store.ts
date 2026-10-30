/**
 * Global UI state (Zustand): effect toggles, palette, terminal, project filters and route.
 * Only effects + palette are persisted.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PALETTE, DEFAULT_POINTER_MODE, effectDefaults, palettes } from '../config/theme';
import { POINTER_MODES, SECTION_IDS } from '../terminal/types';
import type {
  EffectName,
  OpenKind,
  OutputLine,
  PointerMode,
  SectionId,
  SpaceCommand,
  SpaceKind,
} from '../terminal/types';

export interface TerminalLine extends OutputLine {
  id: number;
}

export interface Route {
  section: SectionId | null;
  /** Item id for deep links such as #/projects/<id>. */
  id: string | null;
}

interface UIState {
  effects: Record<EffectName, boolean>;
  palette: string;
  setEffect: (effect: EffectName, value: boolean) => void;
  setPalette: (palette: string) => void;

  terminalOpen: boolean;
  lines: TerminalLine[];
  history: string[];
  setTerminalOpen: (open: boolean) => void;
  pushLines: (lines: OutputLine[]) => void;
  clearLines: () => void;
  pushHistory: (entry: string) => void;

  projectTag: string | null;
  projectSearch: string;
  setProjectFilter: (filter: { tag?: string | null; search?: string }) => void;

  route: Route;
  setRoute: (route: Route) => void;

  /** Mouse-reactive background intensity (persisted). */
  pointerMode: PointerMode;
  setPointerMode: (mode: PointerMode) => void;

  /** Playground mode: panels fade out and the 3D layer receives pointer events. */
  playground: boolean;
  setPlayground: (on: boolean) => void;
  /** Space objects currently alive (written by the 3D layer, read by the HUD and terminal). */
  spaceInstances: SpaceInstance[];
  setSpaceInstances: (list: SpaceInstance[]) => void;
  /** Football kicks this visit (resets on reload). */
  kicks: number;
  addKick: () => void;
  /** Object highlighted via the keyboard toolbar. */
  spaceFocus: string | null;
  setSpaceFocus: (id: string | null) => void;
  /** Object whose info card is open. */
  spaceTooltip: string | null;
  setSpaceTooltip: (id: string | null) => void;
  /** Drag behaviour in playground mode (Shift always moves). */
  spaceDragMode: 'rotate' | 'move';
  setSpaceDragMode: (mode: 'rotate' | 'move') => void;
  /** Latest screen-reader announcement for the space HUD. */
  spaceAnnouncement: string;
  announceSpace: (text: string) => void;
}

export interface SpaceInstance {
  id: string;
  /** Id of the src/data/spaceObjects.ts entry this instance was created from. */
  dataId: string;
  type: SpaceKind;
  label: string;
}

const MAX_LINES = 400;
const MAX_HISTORY = 50;
let lineId = 0;

export const useStore = create<UIState>()(
  persist(
    (set) => ({
      effects: { ...effectDefaults },
      palette: DEFAULT_PALETTE,
      setEffect: (effect, value) => set((s) => ({ effects: { ...s.effects, [effect]: value } })),
      setPalette: (palette) => set({ palette: palette in palettes ? palette : DEFAULT_PALETTE }),

      terminalOpen: false,
      lines: [],
      history: [],
      setTerminalOpen: (terminalOpen) => set({ terminalOpen }),
      pushLines: (lines) =>
        set((s) => ({
          lines: [...s.lines, ...lines.map((l) => ({ ...l, id: ++lineId }))].slice(-MAX_LINES),
        })),
      clearLines: () => set({ lines: [] }),
      pushHistory: (entry) =>
        set((s) => {
          const trimmed = entry.trim();
          if (!trimmed || s.history[s.history.length - 1] === trimmed) return s;
          return { history: [...s.history, trimmed].slice(-MAX_HISTORY) };
        }),

      projectTag: null,
      projectSearch: '',
      setProjectFilter: ({ tag, search }) =>
        set((s) => ({
          projectTag: tag === undefined ? s.projectTag : tag,
          projectSearch: search === undefined ? s.projectSearch : search,
        })),

      route: { section: null, id: null },
      setRoute: (route) => set({ route }),

      pointerMode: DEFAULT_POINTER_MODE,
      setPointerMode: (pointerMode) => set({ pointerMode }),

      playground: false,
      setPlayground: (playground) => set({ playground }),
      spaceInstances: [],
      setSpaceInstances: (spaceInstances) => set({ spaceInstances }),
      kicks: 0,
      addKick: () => set((s) => ({ kicks: s.kicks + 1 })),
      spaceFocus: null,
      setSpaceFocus: (spaceFocus) => set({ spaceFocus }),
      spaceTooltip: null,
      setSpaceTooltip: (spaceTooltip) => set({ spaceTooltip }),
      spaceDragMode: 'rotate',
      setSpaceDragMode: (spaceDragMode) => set({ spaceDragMode }),
      spaceAnnouncement: '',
      announceSpace: (spaceAnnouncement) => set({ spaceAnnouncement }),
    }),
    {
      name: 'hs-portfolio-ui',
      version: 2,
      partialize: (s) => ({ effects: s.effects, palette: s.palette, pointerMode: s.pointerMode }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<
          Pick<UIState, 'effects' | 'palette' | 'pointerMode'>
        >;
        return {
          ...current,
          effects: { ...current.effects, ...(p.effects ?? {}) },
          palette: p.palette && p.palette in palettes ? p.palette : current.palette,
          pointerMode:
            p.pointerMode && (POINTER_MODES as readonly string[]).includes(p.pointerMode)
              ? p.pointerMode
              : current.pointerMode,
        };
      },
    },
  ),
);

/** Section that hosts each openable kind (used for deep links). */
export const KIND_SECTION: Record<OpenKind, SectionId> = {
  project: 'projects',
  paper: 'research',
  'research-project': 'lab',
};

/**
 * Navigate via the hash router. `#/projects` shows a panel, `#/projects/<id>` also opens a modal.
 * `replace` swaps the history entry (used when paging between items inside a modal).
 */
export function navigateTo(
  section: SectionId,
  id?: string,
  opts: { replace?: boolean } = {},
): void {
  const hash = section === 'home' && !id ? '#/' : `#/${section}${id ? `/${id}` : ''}`;
  if (window.location.hash === hash) return;
  if (opts.replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export function currentSection(): SectionId {
  return useStore.getState().route.section ?? 'home';
}

/**
 * Queue of requests for the 3D space objects (terminal, toolbar). Plain array so the UI can push
 * without loading the 3D chunk; the simulation drains it every frame.
 */
export const spaceQueue: SpaceCommand[] = [];

/** Set while an object is being dragged, so swipe navigation ignores that gesture. */
export const spaceInput = { dragging: false };

export function sendSpaceCommand(command: SpaceCommand): void {
  spaceQueue.push(command);
  if (spaceQueue.length > 16) spaceQueue.shift();
}

export function setPlayground(on: boolean): void {
  const s = useStore.getState();
  if (s.playground === on) return;
  s.setPlayground(on);
  s.announceSpace(
    on
      ? 'Playground mode on. Drag to rotate, click to interact, Escape to exit.'
      : 'Playground mode off.',
  );
}

/** Move to the next (+1) / previous (-1) panel, wrapping around. */
export function stepSection(delta: number): void {
  const n = SECTION_IDS.length;
  const i = SECTION_IDS.indexOf(currentSection());
  navigateTo(SECTION_IDS[(i + delta + n) % n] as SectionId);
}


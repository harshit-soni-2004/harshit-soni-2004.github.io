import type {
  Education,
  Experience,
  Paper,
  Profile,
  Project,
  ResearchProject,
  SkillGroup,
} from '../data/types';

/** Everything the terminal can read. Injected so commands stay pure and testable. */
export interface TerminalContent {
  profile: Profile;
  projects: Project[];
  papers: Paper[];
  researchProjects: ResearchProject[];
  experience: Experience[];
  skillGroups: SkillGroup[];
  education: Education[];
}

export const SECTION_IDS = [
  'home',
  'about',
  'projects',
  'lab',
  'research',
  'experience',
  'skills',
  'stack',
  'contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type EffectName = 'scanlines' | 'glitch' | 'bloom' | '3d';

/** Mouse-reactive background intensity (`fx calm|intense|off`). */
export const POINTER_MODES = ['calm', 'intense', 'off'] as const;
export type PointerMode = (typeof POINTER_MODES)[number];

/** Kinds of interactive space objects in the 3D background. */
export const SPACE_KINDS = [
  'station',
  'saucer',
  'ball',
  'rocket',
  'delorean',
  'falcon',
  'walle',
  'milano',
] as const;
export type SpaceKind = (typeof SPACE_KINDS)[number];

/** Requests for the 3D space-object simulation (queued, performed by the 3D layer). */
export type SpaceCommand =
  | { type: 'spawn'; kind: SpaceKind }
  | { type: 'kick'; id?: string }
  | { type: 'interact'; id: string }
  | { type: 'launch' }
  | { type: 'reset' };

/** Runtime state the terminal may read (but never mutate directly). */
export interface TerminalEnv {
  effects: Record<EffectName, boolean>;
  palettes: string[];
  palette: string;
  history: string[];
  pointerMode?: PointerMode;
  playground?: boolean;
  /** Current / maximum number of space objects. */
  space?: { count: number; max: number };
}

export type LineKind = 'input' | 'output' | 'muted' | 'accent' | 'success' | 'error' | 'heading';

export interface OutputLine {
  kind: LineKind;
  text: string;
  /** Optional link; rendered as an anchor. */
  href?: string;
}

export type OpenKind = 'project' | 'paper' | 'research-project';

/** Side effects requested by a command. The UI layer decides how to perform them. */
export type TerminalAction =
  | { type: 'navigate'; section: SectionId }
  | { type: 'open'; kind: OpenKind; id: string }
  | { type: 'filter'; tag: string | null; search: string }
  | { type: 'clear' }
  | { type: 'download'; path: string }
  | { type: 'set-effect'; effect: EffectName; value: boolean }
  | { type: 'set-palette'; palette: string }
  | { type: 'set-pointer-mode'; mode: PointerMode }
  | { type: 'playground'; value: boolean }
  | { type: 'space'; command: SpaceCommand };

export interface CommandResult {
  lines: OutputLine[];
  actions: TerminalAction[];
}

export interface ParsedCommand {
  name: string;
  args: string[];
  flags: Record<string, string | true>;
}

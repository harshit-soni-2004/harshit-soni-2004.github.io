/**
 * Terminal command registry and executor.
 *
 * `executeCommand` is pure: given input, content and env it returns output lines and a list of
 * actions (navigate, open modal, filter, ...). The React layer performs the actions. Because
 * every command reads from `TerminalContent`, new projects/papers are available automatically.
 */
import { closest, formatMonth, formatRange } from '../utils/format';
import { parseCommand, slugify } from './parser';
import type {
  CommandResult,
  EffectName,
  OpenKind,
  OutputLine,
  ParsedCommand,
  PointerMode,
  SectionId,
  SpaceKind,
  TerminalAction,
  TerminalContent,
  TerminalEnv,
} from './types';
import { POINTER_MODES, SECTION_IDS } from './types';

interface CommandContext {
  cmd: ParsedCommand;
  content: TerminalContent;
  env: TerminalEnv;
}

export interface CommandDef {
  name: string;
  aliases?: string[];
  usage: string;
  description: string;
  /** Flags offered by autocomplete. */
  flags?: string[];
  /** Only offer this command in Tab completion once at least this many letters are typed. */
  minCompletionPrefix?: number;
  run: (ctx: CommandContext) => CommandResult;
}

export const EFFECT_NAMES: EffectName[] = ['scanlines', 'glitch', 'bloom', '3d'];

// ---------- line helpers ----------
const out = (text: string): OutputLine => ({ kind: 'output', text });
const muted = (text: string): OutputLine => ({ kind: 'muted', text });
const accent = (text: string): OutputLine => ({ kind: 'accent', text });
const heading = (text: string): OutputLine => ({ kind: 'heading', text });
const error = (text: string): OutputLine => ({ kind: 'error', text });
const success = (text: string): OutputLine => ({ kind: 'success', text });
const link = (text: string, href: string): OutputLine => ({ kind: 'accent', text, href });
const result = (lines: OutputLine[], actions: TerminalAction[] = []): CommandResult => ({
  lines,
  actions,
});
const navigate = (section: SectionId): TerminalAction => ({ type: 'navigate', section });

/** Find any openable item by id (or by a unique id prefix). */
export function findItem(
  id: string,
  content: TerminalContent,
): { kind: OpenKind; id: string; title: string } | undefined {
  const all: { kind: OpenKind; id: string; title: string }[] = [
    ...content.projects.map((p) => ({ kind: 'project' as const, id: p.id, title: p.title })),
    ...content.papers.map((p) => ({ kind: 'paper' as const, id: p.id, title: p.title })),
    ...content.researchProjects.map((p) => ({
      kind: 'research-project' as const,
      id: p.id,
      title: p.title,
    })),
  ];
  const needle = id.toLowerCase();
  const exact = all.find((i) => i.id === needle);
  if (exact) return exact;
  const prefixed = all.filter((i) => i.id.startsWith(needle));
  return prefixed.length === 1 ? prefixed[0] : undefined;
}

export function allItemIds(content: TerminalContent): string[] {
  return [
    ...content.projects.map((p) => p.id),
    ...content.papers.map((p) => p.id),
    ...content.researchProjects.map((p) => p.id),
  ];
}

/** Tags as typed in the terminal (slugified), e.g. 'full-stack'. */
export function projectTagSlugs(content: TerminalContent): string[] {
  return [...new Set(content.projects.flatMap((p) => p.tags.map(slugify)))].sort();
}

const pad = (s: string, n: number) => (s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length));

/** Names accepted by `spawn` (as typed) → object kind. */
export const SPAWN_ALIASES: Record<string, SpaceKind> = {
  ship: 'station',
  station: 'station',
  saucer: 'saucer',
  ball: 'ball',
  mav: 'rocket',
  rocket: 'rocket',
  delorean: 'delorean',
  falcon: 'falcon',
  walle: 'walle',
  'wall-e': 'walle',
  milano: 'milano',
};

const threeDisabledNote = (env: TerminalEnv): OutputLine[] =>
  env.effects['3d'] ? [] : [muted('(The 3D background is off. Run `theme 3d on` to see it.)')];

// ---------- commands ----------
export const commands: CommandDef[] = [
  {
    name: 'help',
    usage: 'help [command]',
    description: 'List commands, or show usage for one command.',
    run: ({ cmd }) => {
      const target = cmd.args[0];
      if (target) {
        const def = resolveCommand(target);
        if (!def) return result([error(`help: no such command '${target}'`)]);
        return result([
          accent(def.usage),
          out(def.description),
          ...(def.aliases?.length ? [muted(`aliases: ${def.aliases.join(', ')}`)] : []),
        ]);
      }
      return result([
        heading('Available commands'),
        ...commands.map((c) => out(`${pad(c.usage, 34)}${c.description}`)),
        muted(''),
        muted('Tips: Tab autocompletes, ↑/↓ browse history, Esc closes the terminal.'),
      ]);
    },
  },
  {
    name: 'about',
    aliases: ['whoami'],
    usage: 'about',
    description: 'Who I am.',
    run: ({ content }) => {
      const p = content.profile;
      return result(
        [
          heading(p.name),
          accent(p.titles.join(' / ')),
          out(p.tagline),
          muted(''),
          ...p.bio.map(out),
          muted(''),
          muted(`${p.location}${p.availability ? ` · ${p.availability}` : ''}`),
        ],
        [navigate('about')],
      );
    },
  },
  {
    name: 'projects',
    aliases: ['ls-projects'],
    usage: 'projects [--tag <tag>] [--search <q>]',
    description: 'List projects, optionally filtered by tag or text.',
    flags: ['--tag', '--search', '--featured'],
    run: ({ cmd, content }) => {
      const tagFlag = cmd.flags.tag ?? cmd.flags.t;
      const searchFlag = cmd.flags.search ?? cmd.flags.s;
      const tag = typeof tagFlag === 'string' ? slugify(tagFlag) : null;
      const search = [typeof searchFlag === 'string' ? searchFlag : '', ...cmd.args]
        .join(' ')
        .trim();
      const featuredOnly = cmd.flags.featured === true;

      if (tagFlag === true) {
        return result([
          error('projects: --tag needs a value.'),
          muted(`tags: ${projectTagSlugs(content).join(', ')}`),
        ]);
      }

      // Resolve the slug back to the display tag so the UI filter chip lights up.
      const displayTag = tag
        ? content.projects.flatMap((p) => p.tags).find((t) => slugify(t) === tag)
        : undefined;
      if (tag && !displayTag) {
        const suggestion = closest(tag, projectTagSlugs(content));
        return result([
          error(
            `projects: unknown tag '${tag}'.${suggestion ? ` Did you mean '${suggestion}'?` : ''}`,
          ),
          muted(`tags: ${projectTagSlugs(content).join(', ')}`),
        ]);
      }

      const q = search.toLowerCase();
      const list = content.projects.filter(
        (p) =>
          (!tag || p.tags.some((t) => slugify(t) === tag)) &&
          (!featuredOnly || p.featured) &&
          (!q ||
            [p.title, p.summary, ...p.tech, ...p.tags].some((f) => f.toLowerCase().includes(q))),
      );

      const lines: OutputLine[] = [
        heading(
          `${list.length} project${list.length === 1 ? '' : 's'}${displayTag ? ` tagged ${displayTag}` : ''}${q ? ` matching "${search}"` : ''}`,
        ),
      ];
      const width = Math.max(...list.map((p) => p.id.length), 4) + 2;
      list.forEach((p) =>
        lines.push(
          out(`${p.featured ? '★' : ' '} ${pad(p.id, width)}${p.title}  [${p.tags.join(', ')}]`),
        ),
      );
      if (list.length === 0) lines.push(muted('No matches. Try `projects` without filters.'));
      else lines.push(muted('Run `open <id>` for details.'));

      return result(lines, [
        { type: 'filter', tag: displayTag ?? null, search },
        navigate('projects'),
      ]);
    },
  },
  {
    name: 'research',
    aliases: ['papers'],
    usage: 'research',
    description: 'List papers and research projects.',
    run: ({ content }) => {
      const lines: OutputLine[] = [heading(`Papers (${content.papers.length})`)];
      content.papers.forEach((p) =>
        lines.push(out(`  ${pad(p.id, 22)}${p.title} — ${p.venue} ${p.year}`)),
      );
      lines.push(heading(`Research projects (${content.researchProjects.length})`));
      content.researchProjects.forEach((p) => lines.push(out(`  ${pad(p.id, 22)}${p.title}`)));
      lines.push(muted('Run `open <id>` for details.'));
      return result(lines, [navigate('research')]);
    },
  },
  {
    name: 'open',
    usage: 'open <id>',
    description: 'Open a project, paper or research project by id.',
    run: ({ cmd, content }) => {
      const id = cmd.args[0];
      if (!id) {
        return result([
          error('open: missing id.'),
          muted(`ids: ${allItemIds(content).join(', ')}`),
        ]);
      }
      const item = findItem(id, content);
      if (!item) {
        const suggestion = closest(id, allItemIds(content));
        return result([
          error(`open: '${id}' not found.${suggestion ? ` Did you mean '${suggestion}'?` : ''}`),
        ]);
      }
      return result(
        [success(`Opening ${item.title}…`)],
        [{ type: 'open', kind: item.kind, id: item.id }],
      );
    },
  },
  {
    name: 'experience',
    aliases: ['exp', 'log'],
    usage: 'experience',
    description: 'Work history as a git log.',
    run: ({ content }) => {
      const lines: OutputLine[] = [];
      content.experience.forEach((e, i) => {
        lines.push(accent(`* ${e.role} @ ${e.company}${i === 0 ? '  (HEAD -> main)' : ''}`));
        lines.push(muted(`| ${formatRange(e.start, e.end)} · ${e.type} · ${e.location}`));
        e.highlights.slice(0, 3).forEach((h) => lines.push(out(`|   ${h}`)));
        if (e.highlights.length > 3) lines.push(muted(`|   …${e.highlights.length - 3} more`));
      });
      return result(lines, [navigate('experience')]);
    },
  },
  {
    name: 'skills',
    usage: 'skills [group]',
    description: 'Show skills, optionally one group.',
    run: ({ cmd, content }) => {
      const group = cmd.args[0]?.toLowerCase();
      const groups = group
        ? content.skillGroups.filter((g) => g.id === group || slugify(g.title) === slugify(group))
        : content.skillGroups;
      if (groups.length === 0) {
        return result([
          error(`skills: unknown group '${group}'.`),
          muted(`groups: ${content.skillGroups.map((g) => g.id).join(', ')}`),
        ]);
      }
      const lines: OutputLine[] = [];
      groups.forEach((g) => {
        lines.push(heading(g.title));
        lines.push(out(`  ${g.skills.map((s) => s.name).join(' · ')}`));
      });
      return result(lines, [navigate('skills')]);
    },
  },
  {
    name: 'education',
    aliases: ['edu'],
    usage: 'education',
    description: 'Degrees and schools.',
    run: ({ content }) =>
      result(
        content.education.flatMap((e) => [
          accent(e.degree),
          out(`  ${e.institution}, ${e.location}`),
          muted(
            `  ${e.start ? `${formatMonth(e.start)} — ` : ''}${formatMonth(e.end)}${e.score ? ` · ${e.score}` : ''}`,
          ),
        ]),
        [navigate('about')],
      ),
  },
  {
    name: 'contact',
    usage: 'contact',
    description: 'How to reach me.',
    run: ({ content }) =>
      result(
        [
          heading('Contact'),
          ...content.profile.socials.map((s) => link(`  ${pad(s.label, 10)}${s.handle}`, s.url)),
        ],
        [navigate('contact')],
      ),
  },
  {
    name: 'resume',
    aliases: ['cv'],
    usage: 'resume',
    description: 'Download my resume (PDF).',
    run: ({ content }) =>
      result(
        [success('Downloading resume…')],
        [{ type: 'download', path: content.profile.resumePath }],
      ),
  },
  {
    name: 'theme',
    usage: 'theme [palette | <effect> [on|off]]',
    description: 'Switch palette or toggle scanlines, glitch, bloom, 3d.',
    run: ({ cmd, env }) => {
      const [target, value] = cmd.args.map((a) => a.toLowerCase());
      if (!target) {
        return result([
          heading('Theme'),
          out(`  palette   ${env.palette}   (available: ${env.palettes.join(', ')})`),
          ...EFFECT_NAMES.map((e) => out(`  ${pad(e, 10)}${env.effects[e] ? 'on' : 'off'}`)),
          muted('Usage: theme <palette>  |  theme <effect> [on|off]'),
        ]);
      }
      if (env.palettes.includes(target)) {
        return result(
          [success(`Palette set to ${target}.`)],
          [{ type: 'set-palette', palette: target }],
        );
      }
      if ((EFFECT_NAMES as string[]).includes(target)) {
        const effect = target as EffectName;
        let next: boolean;
        if (value === 'on') next = true;
        else if (value === 'off') next = false;
        else if (value === undefined) next = !env.effects[effect];
        else return result([error(`theme: expected 'on' or 'off', got '${value}'.`)]);
        return result(
          [success(`${effect} ${next ? 'enabled' : 'disabled'}.`)],
          [{ type: 'set-effect', effect, value: next }],
        );
      }
      return result([
        error(`theme: unknown option '${target}'.`),
        muted(`palettes: ${env.palettes.join(', ')} · effects: ${EFFECT_NAMES.join(', ')}`),
      ]);
    },
  },
  {
    name: 'fx',
    usage: 'fx [calm|intense|off]',
    description: 'How strongly the 3D background reacts to the mouse.',
    run: ({ cmd, env }) => {
      const mode = cmd.args[0]?.toLowerCase();
      if (!mode) {
        return result([
          out(`pointer fx: ${env.pointerMode ?? 'calm'}`),
          muted(`Usage: fx <${POINTER_MODES.join('|')}>`),
        ]);
      }
      if (!(POINTER_MODES as readonly string[]).includes(mode)) {
        return result([
          error(`fx: unknown mode '${mode}'.`),
          muted(`modes: ${POINTER_MODES.join(', ')}`),
        ]);
      }
      const m = mode as PointerMode;
      return result(
        [success(m === 'off' ? 'Pointer effects disabled.' : `Pointer effects set to ${m}.`)],
        [{ type: 'set-pointer-mode', mode: m }],
      );
    },
  },
  {
    name: 'play',
    usage: 'play',
    description: 'Playground mode: play with the objects floating in the background.',
    run: ({ env }) => {
      if (env.playground) return result([muted('Already in playground mode. `exit` to leave.')]);
      return result(
        [
          success('Playground mode on: drag to rotate, click to interact, Esc or `exit` to leave.'),
          ...threeDisabledNote(env),
        ],
        [{ type: 'playground', value: true }],
      );
    },
  },
  {
    name: 'exit',
    usage: 'exit',
    description: 'Leave playground mode.',
    run: ({ env }) =>
      env.playground
        ? result([success('Back to work.')], [{ type: 'playground', value: false }])
        : result([muted('Nothing to exit. (There is no escape. Try `play`.)')]),
  },
  {
    name: 'spawn',
    usage: 'spawn <ship|saucer|ball|mav|delorean|falcon|walle|milano>',
    description: 'Add another floating object.',
    run: ({ cmd, env }) => {
      const arg = cmd.args[0]?.toLowerCase();
      const kind = arg ? SPAWN_ALIASES[arg] : undefined;
      if (!kind) {
        return result([
          error(arg ? `spawn: unknown object '${arg}'.` : 'spawn: what should I spawn?'),
          muted(`objects: ${Object.keys(SPAWN_ALIASES).join(', ')}`),
        ]);
      }
      if (env.space && env.space.count >= env.space.max) {
        return result([
          error(`spawn: space is full (${env.space.max} objects max). Try \`reset\`.`),
        ]);
      }
      return result(
        [success(`Spawned a ${arg}.`), ...threeDisabledNote(env)],
        [{ type: 'space', command: { type: 'spawn', kind } }],
      );
    },
  },
  {
    name: 'kick',
    usage: 'kick',
    description: 'Kick the football.',
    run: ({ env }) =>
      result(
        [success('⚽ Kick!'), ...threeDisabledNote(env)],
        [{ type: 'space', command: { type: 'kick' } }],
      ),
  },
  {
    name: 'launch',
    usage: 'launch',
    description: 'Boost the ships across the screen.',
    run: ({ env }) =>
      result(
        [success('Thrusters engaged. 🚀'), ...threeDisabledNote(env)],
        [{ type: 'space', command: { type: 'launch' } }],
      ),
  },
  {
    name: 'reset',
    usage: 'reset',
    description: 'Restore the default floating objects.',
    minCompletionPrefix: 3,
    run: () =>
      result([success('Space objects reset.')], [{ type: 'space', command: { type: 'reset' } }]),
  },
  {
    name: 'ls',
    usage: 'ls',
    description: 'List site sections.',
    run: () =>
      result([
        out(
          SECTION_IDS.filter((s) => s !== 'home')
            .map((s) => `${s}/`)
            .join('  '),
        ),
      ]),
  },
  {
    name: 'cd',
    usage: 'cd <section>',
    description: 'Jump to a section.',
    run: ({ cmd }) => {
      const raw = (cmd.args[0] ?? '~')
        .replace(/^\.?\/?/, '')
        .replace(/\/$/, '')
        .toLowerCase();
      const section: SectionId | undefined =
        raw === '' || raw === '~' || raw === '..'
          ? 'home'
          : (SECTION_IDS as readonly string[]).includes(raw)
            ? (raw as SectionId)
            : undefined;
      if (!section) return result([error(`cd: no such section: ${raw}`)]);
      return result([], [navigate(section)]);
    },
  },
  {
    name: 'history',
    usage: 'history',
    description: 'Show previously entered commands.',
    run: ({ env }) =>
      result(
        env.history.length
          ? env.history.map((h, i) => out(`${String(i + 1).padStart(4)}  ${h}`))
          : [muted('No history yet.')],
      ),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    usage: 'clear',
    description: 'Clear the terminal.',
    run: () => result([], [{ type: 'clear' }]),
  },
];

const HIDDEN: Record<string, (ctx: CommandContext) => CommandResult> = {
  sudo: () => result([error('Permission denied: nice try. This incident will be reported.')]),
};

export function resolveCommand(name: string): CommandDef | undefined {
  const n = name.toLowerCase();
  return commands.find((c) => c.name === n || c.aliases?.includes(n));
}

export function commandNames(): string[] {
  return commands.map((c) => c.name);
}

/** Execute one line of input. Never throws. */
export function executeCommand(
  input: string,
  content: TerminalContent,
  env: TerminalEnv,
): CommandResult {
  const cmd = parseCommand(input);
  if (!cmd.name) return result([]);

  // Navigation shortcuts: `./projects` or `projects/` behave like `cd`.
  const pathLike = cmd.name.match(/^\.\/([a-z]+)\/?$/);
  if (pathLike?.[1] && (SECTION_IDS as readonly string[]).includes(pathLike[1])) {
    const asCommand = resolveCommand(pathLike[1]);
    if (asCommand) return asCommand.run({ cmd: { ...cmd, name: asCommand.name }, content, env });
    return result([], [navigate(pathLike[1] as SectionId)]);
  }

  const def = resolveCommand(cmd.name);
  if (def) {
    try {
      return def.run({ cmd, content, env });
    } catch (e) {
      return result([error(`${cmd.name}: ${e instanceof Error ? e.message : 'unexpected error'}`)]);
    }
  }
  const hidden = HIDDEN[cmd.name];
  if (hidden) return hidden({ cmd, content, env });

  const suggestion = closest(
    cmd.name,
    commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]),
    2,
  );
  return result([
    error(`command not found: ${cmd.name}`),
    muted(
      suggestion
        ? `Did you mean '${suggestion}'? Type 'help' for a list.`
        : "Type 'help' for a list of commands.",
    ),
  ]);
}

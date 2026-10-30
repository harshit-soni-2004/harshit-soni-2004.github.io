import { allItemIds, commands, EFFECT_NAMES, projectTagSlugs, resolveCommand } from './commands';
import { slugify } from './parser';
import type { TerminalContent, TerminalEnv } from './types';
import { POINTER_MODES, SECTION_IDS } from './types';

export interface Completion {
  /** The new input value (unchanged if nothing to complete). */
  value: string;
  /** All candidates for the current token; shown to the user when ambiguous. */
  options: string[];
}

function commonPrefix(values: string[]): string {
  if (values.length === 0) return '';
  let prefix = values[0] as string;
  for (const v of values) {
    while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/** Candidates for the token at `position` (0 = command name) given previous tokens. */
function candidatesFor(
  tokens: string[],
  content: TerminalContent,
  env: Pick<TerminalEnv, 'palettes'>,
): string[] {
  if (tokens.length <= 1) {
    const typed = (tokens[0] ?? '').length;
    return commands.filter((c) => typed >= (c.minCompletionPrefix ?? 0)).map((c) => c.name);
  }
  const def = resolveCommand(tokens[0] as string);
  if (!def) return [];
  const prev = tokens[tokens.length - 2] ?? '';
  const current = tokens[tokens.length - 1] ?? '';

  switch (def.name) {
    case 'open':
      return tokens.length === 2 ? allItemIds(content) : [];
    case 'help':
      return tokens.length === 2 ? commands.map((c) => c.name) : [];
    case 'cd':
      return tokens.length === 2 ? SECTION_IDS.filter((s) => s !== 'home') : [];
    case 'skills':
      return tokens.length === 2 ? content.skillGroups.map((g) => g.id) : [];
    case 'theme':
      if (tokens.length === 2) return [...env.palettes, ...EFFECT_NAMES];
      if (tokens.length === 3 && (EFFECT_NAMES as string[]).includes(prev)) return ['on', 'off'];
      return [];
    case 'fx':
      return tokens.length === 2 ? [...POINTER_MODES] : [];
    case 'spawn':
      return tokens.length === 2
        ? ['ship', 'saucer', 'ball', 'mav', 'delorean', 'falcon', 'walle', 'milano']
        : [];
    case 'projects':
      if (prev === '--tag' || prev === '-t') return projectTagSlugs(content);
      if (current.startsWith('-')) return def.flags ?? [];
      return [];
    default:
      return def.flags && current.startsWith('-') ? def.flags : [];
  }
}

/**
 * Tab completion. Completes the last token of `input`.
 * - single match → completes it and adds a trailing space
 * - several matches → extends to the longest common prefix and returns all options
 */
export function autocomplete(
  input: string,
  content: TerminalContent,
  env: Pick<TerminalEnv, 'palettes'>,
): Completion {
  const endsWithSpace = /\s$/.test(input);
  const tokens = input.trimStart().split(/\s+/).filter(Boolean);
  if (endsWithSpace || tokens.length === 0) tokens.push('');

  const current = (tokens[tokens.length - 1] ?? '').toLowerCase();
  const candidates = candidatesFor(tokens, content, env);
  const needle = current.startsWith('-') ? current : slugify(current) || current;
  const matches = candidates.filter((c) => c.toLowerCase().startsWith(needle));
  const head = input.slice(0, input.length - (tokens[tokens.length - 1] ?? '').length);

  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) return { value: `${head}${matches[0]} `, options: matches };

  const prefix = commonPrefix(matches);
  return {
    value: prefix.length > current.length ? `${head}${prefix}` : input,
    options: matches,
  };
}

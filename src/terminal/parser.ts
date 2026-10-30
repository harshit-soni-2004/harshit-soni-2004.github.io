import type { ParsedCommand } from './types';

/**
 * Split input into tokens, honouring single and double quotes.
 *   tokenize(`projects --search "spring boot"`) → ['projects', '--search', 'spring boot']
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
    } else if (/\s/.test(ch)) {
      if (hasToken) tokens.push(current);
      current = '';
      hasToken = false;
    } else {
      current += ch;
      hasToken = true;
    }
  }
  if (hasToken) tokens.push(current);
  return tokens;
}

/**
 * Parse a command line into name, positional args and flags.
 * Supported flag forms: `--tag devops`, `--tag=devops`, `-t devops`, `--featured` (boolean).
 * A flag followed by another flag (or end of input) is boolean.
 */
export function parseCommand(input: string): ParsedCommand {
  const tokens = tokenize(input.trim());
  const [first = '', ...rest] = tokens;
  const flags: Record<string, string | true> = {};
  const args: string[] = [];

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i] as string;
    if (token.startsWith('-') && token.length > 1 && !/^-\d/.test(token)) {
      const stripped = token.replace(/^--?/, '');
      const eq = stripped.indexOf('=');
      if (eq >= 0) {
        flags[stripped.slice(0, eq).toLowerCase()] = stripped.slice(eq + 1);
        continue;
      }
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        flags[stripped.toLowerCase()] = next;
        i++;
      } else {
        flags[stripped.toLowerCase()] = true;
      }
    } else {
      args.push(token);
    }
  }

  return { name: first.toLowerCase(), args, flags };
}

/** Normalise a tag for comparisons: 'Full Stack' → 'full-stack'. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

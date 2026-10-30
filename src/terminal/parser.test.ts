import { describe, expect, it } from 'vitest';
import { parseCommand, slugify, tokenize } from './parser';

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('  projects   --tag devops ')).toEqual(['projects', '--tag', 'devops']);
  });

  it('keeps quoted strings together', () => {
    expect(tokenize(`projects --search "spring boot"`)).toEqual([
      'projects',
      '--search',
      'spring boot',
    ]);
    expect(tokenize(`echo 'a b' c`)).toEqual(['echo', 'a b', 'c']);
  });

  it('keeps empty quoted tokens', () => {
    expect(tokenize(`x ""`)).toEqual(['x', '']);
  });
});

describe('parseCommand', () => {
  it('lowercases the command name', () => {
    expect(parseCommand('HELP').name).toBe('help');
  });

  it('parses --flag value, --flag=value and -f value', () => {
    expect(parseCommand('projects --tag devops').flags).toEqual({ tag: 'devops' });
    expect(parseCommand('projects --tag=devops').flags).toEqual({ tag: 'devops' });
    expect(parseCommand('projects -t devops').flags).toEqual({ t: 'devops' });
  });

  it('treats a flag without value as boolean', () => {
    expect(parseCommand('projects --featured').flags).toEqual({ featured: true });
    expect(parseCommand('projects --featured --tag ml').flags).toEqual({
      featured: true,
      tag: 'ml',
    });
  });

  it('collects positional args', () => {
    expect(parseCommand('open ami-tool extra')).toEqual({
      name: 'open',
      args: ['ami-tool', 'extra'],
      flags: {},
    });
  });

  it('parses playground commands with their argument', () => {
    expect(parseCommand('spawn Ball')).toEqual({ name: 'spawn', args: ['Ball'], flags: {} });
    expect(parseCommand('FX calm')).toEqual({ name: 'fx', args: ['calm'], flags: {} });
    expect(parseCommand('  play  ')).toEqual({ name: 'play', args: [], flags: {} });
  });

  it('handles empty input', () => {
    expect(parseCommand('   ')).toEqual({ name: '', args: [], flags: {} });
  });
});

describe('slugify', () => {
  it('normalises tags', () => {
    expect(slugify('Full Stack')).toBe('full-stack');
    expect(slugify('  ML / AI ')).toBe('ml-ai');
  });
});

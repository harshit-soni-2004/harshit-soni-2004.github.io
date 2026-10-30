import { describe, expect, it } from 'vitest';
import { executeCommand } from './commands';
import { autocomplete } from './autocomplete';
import { fixtureContent as content, fixtureEnv as env } from './fixtures';
import { siteContent } from './content';
import { validateContent } from '../data/validate';

const run = (input: string) => executeCommand(input, content, env);
const text = (input: string) =>
  run(input)
    .lines.map((l) => l.text)
    .join('\n');

describe('executeCommand', () => {
  it('returns nothing for empty input', () => {
    expect(run('   ')).toEqual({ lines: [], actions: [] });
  });

  it('lists every command in help', () => {
    const out = text('help');
    for (const name of [
      'about',
      'projects',
      'research',
      'open',
      'skills',
      'contact',
      'resume',
      'theme',
      'clear',
    ]) {
      expect(out).toContain(name);
    }
  });

  it('suggests a close match for unknown commands', () => {
    const res = run('projcts');
    expect(res.lines[0]?.kind).toBe('error');
    expect(text('projcts')).toContain("Did you mean 'projects'");
  });

  it('lists all projects and navigates', () => {
    const res = run('projects');
    expect(text('projects')).toContain('ami-tool');
    expect(text('projects')).toContain('finance-app');
    expect(res.actions).toContainEqual({ type: 'navigate', section: 'projects' });
    expect(res.actions).toContainEqual({ type: 'filter', tag: null, search: '' });
  });

  it('filters projects by tag (case-insensitive, slugified)', () => {
    const res = run('projects --tag devops');
    const out = text('projects --tag devops');
    expect(out).toContain('ami-tool');
    expect(out).not.toContain('finance-app');
    expect(res.actions).toContainEqual({ type: 'filter', tag: 'DevOps', search: '' });

    expect(text('projects --tag full-stack')).toContain('finance-app');
    expect(text('projects --tag "Full Stack"')).toContain('finance-app');
  });

  it('reports unknown tags with a suggestion', () => {
    expect(text('projects --tag devop')).toContain("Did you mean 'devops'");
  });

  it('searches projects by text', () => {
    const out = text('projects --search angular');
    expect(out).toContain('finance-app');
    expect(out).not.toContain('ami-tool');
  });

  it('opens items of every kind by id', () => {
    expect(run('open ami-tool').actions).toEqual([
      { type: 'open', kind: 'project', id: 'ami-tool' },
    ]);
    expect(run('open paper-one').actions).toEqual([
      { type: 'open', kind: 'paper', id: 'paper-one' },
    ]);
    expect(run('open rp-one').actions).toEqual([
      { type: 'open', kind: 'research-project', id: 'rp-one' },
    ]);
  });

  it('opens by unique prefix and errors on unknown ids', () => {
    expect(run('open fin').actions[0]).toMatchObject({ id: 'finance-app' });
    const res = run('open nope');
    expect(res.actions).toEqual([]);
    expect(res.lines[0]?.kind).toBe('error');
  });

  it('downloads the resume', () => {
    expect(run('resume').actions).toEqual([{ type: 'download', path: 'resume/test.pdf' }]);
  });

  it('toggles and sets effects via theme', () => {
    expect(run('theme scanlines').actions).toEqual([
      { type: 'set-effect', effect: 'scanlines', value: false },
    ]);
    expect(run('theme bloom on').actions).toEqual([
      { type: 'set-effect', effect: 'bloom', value: true },
    ]);
    expect(run('theme matrix').actions).toEqual([{ type: 'set-palette', palette: 'matrix' }]);
    expect(run('theme bogus').lines[0]?.kind).toBe('error');
  });

  it('supports ./section and cd navigation', () => {
    expect(run('./skills').actions).toContainEqual({ type: 'navigate', section: 'skills' });
    expect(run('cd contact').actions).toEqual([{ type: 'navigate', section: 'contact' }]);
    expect(run('cd ~').actions).toEqual([{ type: 'navigate', section: 'home' }]);
  });

  it('clears', () => {
    expect(run('clear').actions).toEqual([{ type: 'clear' }]);
    expect(run('cls').actions).toEqual([{ type: 'clear' }]);
  });
});

describe('autocomplete', () => {
  const complete = (input: string) => autocomplete(input, content, env);

  it('completes command names', () => {
    expect(complete('proj').value).toBe('projects ');
    expect(complete('re').options).toEqual(['research', 'resume']);
    expect(complete('re').value).toBe('res');
    expect(complete('res').value).toBe('res');
  });

  it('completes ids after open', () => {
    expect(complete('open ami').value).toBe('open ami-tool ');
    expect(complete('open ').options).toEqual(['ami-tool', 'finance-app', 'paper-one', 'rp-one']);
  });

  it('completes tags after --tag', () => {
    expect(complete('projects --tag dev').value).toBe('projects --tag devops ');
    expect(complete('projects --t').value).toBe('projects --tag ');
  });

  it('completes theme options', () => {
    expect(complete('theme mat').value).toBe('theme matrix ');
    expect(complete('theme glitch o').options).toEqual(['on', 'off']);
  });

  it('returns input unchanged when nothing matches', () => {
    expect(complete('zzz')).toEqual({ value: 'zzz', options: [] });
  });

  it('completes fx modes and spawnable objects', () => {
    expect(complete('fx ').options).toEqual(['calm', 'intense', 'off']);
    expect(complete('fx int').value).toBe('fx intense ');
    expect(complete('spawn sa').value).toBe('spawn saucer ');
    expect(complete('spawn ').options).toEqual([
      'ship',
      'saucer',
      'ball',
      'mav',
      'delorean',
      'falcon',
      'walle',
      'milano',
    ]);
  });

  it('completes the playground commands', () => {
    expect(complete('pla').value).toBe('play ');
    expect(complete('lau').value).toBe('launch ');
    expect(complete('res').options).toContain('reset');
    expect(complete('rese').options).toEqual(['research', 'reset']);
  });
});

describe('fx command', () => {
  it('switches pointer intensity live', () => {
    expect(run('fx calm').actions).toEqual([{ type: 'set-pointer-mode', mode: 'calm' }]);
    expect(run('fx INTENSE').actions).toEqual([{ type: 'set-pointer-mode', mode: 'intense' }]);
    expect(run('fx off').actions).toEqual([{ type: 'set-pointer-mode', mode: 'off' }]);
  });

  it('shows the current mode without arguments', () => {
    const res = executeCommand('fx', content, { ...env, pointerMode: 'intense' });
    expect(res.actions).toEqual([]);
    expect(res.lines[0]?.text).toContain('intense');
  });

  it('rejects unknown modes', () => {
    const res = run('fx wild');
    expect(res.lines[0]?.kind).toBe('error');
    expect(res.actions).toEqual([]);
  });

  it('is listed in help', () => {
    expect(text('help')).toContain('fx [calm|intense|off]');
  });
});

describe('playground commands', () => {
  it('enters and leaves playground mode', () => {
    expect(run('play').actions).toEqual([{ type: 'playground', value: true }]);
    expect(run('exit').actions).toEqual([]);
    const inPlay = { ...env, playground: true };
    expect(executeCommand('exit', content, inPlay).actions).toEqual([
      { type: 'playground', value: false },
    ]);
    expect(executeCommand('play', content, inPlay).actions).toEqual([]);
  });

  it('spawns objects by name, up to the limit', () => {
    expect(run('spawn ball').actions).toEqual([
      { type: 'space', command: { type: 'spawn', kind: 'ball' } },
    ]);
    expect(run('spawn ship').actions).toEqual([
      { type: 'space', command: { type: 'spawn', kind: 'station' } },
    ]);
    expect(run('spawn').lines[0]?.kind).toBe('error');
    expect(run('spawn dragon').lines[0]?.kind).toBe('error');
    const full = executeCommand('spawn saucer', content, { ...env, space: { count: 6, max: 6 } });
    expect(full.lines[0]?.kind).toBe('error');
    expect(full.actions).toEqual([]);
  });

  it('kicks, launches and resets', () => {
    expect(run('kick').actions).toEqual([{ type: 'space', command: { type: 'kick' } }]);
    expect(run('launch').actions).toEqual([{ type: 'space', command: { type: 'launch' } }]);
    expect(run('reset').actions).toEqual([{ type: 'space', command: { type: 'reset' } }]);
  });

  it('hints when the 3D background is off', () => {
    const off = { ...env, effects: { ...env.effects, '3d': false } };
    expect(
      executeCommand('kick', content, off)
        .lines.map((l) => l.text)
        .join('\n'),
    ).toContain('theme 3d on');
  });

  it('lists the new commands in help', () => {
    const out = text('help');
    for (const c of ['play', 'exit', 'spawn', 'kick', 'launch', 'reset']) expect(out).toContain(c);
  });
});

describe('real site content', () => {
  it('passes validation (unique ids, formats)', () => {
    expect(
      validateContent({
        projects: siteContent.projects,
        papers: siteContent.papers,
        researchProjects: siteContent.researchProjects,
        experience: siteContent.experience,
        skillGroups: siteContent.skillGroups,
      }),
    ).toEqual([]);
  });

  it('exposes every project to the terminal automatically', () => {
    const out = executeCommand('projects', siteContent, env)
      .lines.map((l) => l.text)
      .join('\n');
    siteContent.projects.forEach((p) => expect(out).toContain(p.id));
  });

  it('detects duplicate ids', () => {
    const dup = { ...content.projects[0]!, title: 'Copy' };
    const errors = validateContent({
      projects: [...content.projects, dup],
      papers: content.papers,
      researchProjects: content.researchProjects,
      experience: content.experience,
      skillGroups: content.skillGroups,
    });
    expect(errors.some((e) => e.includes('Duplicate id "ami-tool"'))).toBe(true);
  });
});

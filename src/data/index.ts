/**
 * Single entry point for content. Components import from here, never from individual
 * data files, so derived values (sorting, tag lists, stats) stay consistent everywhere.
 */
import { profile } from './profile';
import { projects } from './projects';
import { papers, researchProjects } from './research';
import { experience } from './experience';
import { skillGroups } from './skills';
import { certifications, education } from './education';
import { spaceObjects } from './spaceObjects';
import { stackLayers } from './stack';
import { validateContent } from './validate';
import type { Project } from './types';

export * from './types';
export {
  profile,
  papers,
  researchProjects,
  experience,
  skillGroups,
  education,
  certifications,
  spaceObjects,
  stackLayers,
};

/** Featured first, then newest first. */
export function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}

export const sortedProjects = sortProjects(projects);
export { projects };

/** Unique tags ordered by how many items use them (most common first). */
export function collectTags(items: { tags: string[] }[]): string[] {
  const counts = new Map<string, number>();
  items.forEach((i) => i.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t);
}

export const projectTags = collectTags(projects);

export const stats = {
  projects: projects.length,
  papers: papers.length,
  researchProjects: researchProjects.length,
  roles: experience.length,
  technologies: new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name))).size,
};

if (import.meta.env.DEV) {
  const errors = validateContent({ projects, papers, researchProjects, experience, skillGroups });
  if (errors.length > 0) {
    console.error(
      `[content] ${errors.length} problem(s) found in src/data:\n` +
        errors.map((e) => `  • ${e}`).join('\n'),
    );
  }
}

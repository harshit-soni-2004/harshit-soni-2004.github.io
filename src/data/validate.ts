import type { Experience, Paper, Project, ResearchProject, SkillGroup } from './types';

export interface ContentToValidate {
  projects: Project[];
  papers: Paper[];
  researchProjects: ResearchProject[];
  experience: Experience[];
  skillGroups: SkillGroup[];
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}(-\d{2}){0,2}$/;

/**
 * Pure content checks that TypeScript can't express: unique ids, URL-safe ids, date format,
 * image alt text. Returns human-readable error messages (empty array = valid).
 */
export function validateContent(content: ContentToValidate): string[] {
  const errors: string[] = [];

  // Projects, papers and research projects share one id namespace because `open <id>`
  // and deep links resolve across all three.
  const seen = new Map<string, string>();
  const register = (id: string, where: string) => {
    if (!ID_PATTERN.test(id)) {
      errors.push(`${where}: id "${id}" must be lowercase letters, numbers and dashes.`);
    }
    const prev = seen.get(id);
    if (prev) errors.push(`Duplicate id "${id}" in ${where} (already used in ${prev}).`);
    else seen.set(id, where);
  };

  content.projects.forEach((p) => {
    register(p.id, 'projects.ts');
    if (!DATE_PATTERN.test(p.date)) errors.push(`projects.ts "${p.id}": date must be YYYY-MM.`);
    if (p.image && !p.imageAlt) errors.push(`projects.ts "${p.id}": image set without imageAlt.`);
    if (p.tags.length === 0) errors.push(`projects.ts "${p.id}": add at least one tag.`);
  });
  content.papers.forEach((p) => {
    register(p.id, 'research.ts (papers)');
    if (p.image && !p.imageAlt) errors.push(`research.ts "${p.id}": image set without imageAlt.`);
  });
  const paperIds = new Set(content.papers.map((p) => p.id));
  content.researchProjects.forEach((p) => {
    register(p.id, 'research.ts (researchProjects)');
    if (!DATE_PATTERN.test(p.date)) errors.push(`research.ts "${p.id}": date must be YYYY-MM.`);
    if (p.image && !p.imageAlt) errors.push(`research.ts "${p.id}": image set without imageAlt.`);
    if (p.paper && !paperIds.has(p.paper)) {
      errors.push(`research.ts "${p.id}": paper "${p.paper}" does not exist.`);
    }
  });

  const expIds = new Set<string>();
  content.experience.forEach((e) => {
    if (expIds.has(e.id)) errors.push(`Duplicate id "${e.id}" in experience.ts.`);
    expIds.add(e.id);
  });

  const groupIds = new Set<string>();
  content.skillGroups.forEach((g) => {
    if (groupIds.has(g.id)) errors.push(`Duplicate id "${g.id}" in skills.ts.`);
    groupIds.add(g.id);
    g.skills.forEach((s) => {
      if (s.level !== undefined && (s.level < 0 || s.level > 100)) {
        errors.push(`skills.ts "${g.id}/${s.name}": level must be 0-100.`);
      }
    });
  });

  return errors;
}

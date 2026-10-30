import {
  education,
  experience,
  papers,
  profile,
  researchProjects,
  skillGroups,
  sortedProjects,
} from '../data';
import type { TerminalContent } from './types';

/** The live site content, wired into the terminal. */
export const siteContent: TerminalContent = {
  profile,
  projects: sortedProjects,
  papers,
  researchProjects,
  experience,
  skillGroups,
  education,
};

import type { TerminalContent, TerminalEnv } from './types';

/** Small, stable content set for unit tests (independent of the real data files). */
export const fixtureContent: TerminalContent = {
  profile: {
    name: 'Test User',
    handle: 'test',
    titles: ['DevOps Engineer', 'SDE'],
    tagline: 'Tagline',
    bio: ['Bio paragraph.'],
    location: 'Mumbai',
    email: 'test@example.com',
    resumePath: 'resume/test.pdf',
    socials: [{ label: 'GitHub', url: 'https://github.com/test', handle: 'test' }],
  },
  projects: [
    {
      id: 'ami-tool',
      title: 'AMI Tool',
      summary: 'Patches AMIs',
      description: 'd',
      highlights: [],
      tags: ['DevOps', 'Security'],
      tech: ['Python', 'Trivy'],
      featured: true,
      date: '2026-09',
    },
    {
      id: 'finance-app',
      title: 'Finance App',
      summary: 'Tracks spending',
      description: 'd',
      highlights: [],
      tags: ['SDE', 'Full Stack'],
      tech: ['Spring Boot', 'Angular'],
      date: '2026-10',
    },
  ],
  papers: [
    {
      id: 'paper-one',
      title: 'Paper One',
      authors: ['Test User'],
      venue: 'ICCDS',
      year: 2025,
      abstract: 'a',
      tags: ['ML'],
    },
  ],
  researchProjects: [
    {
      id: 'rp-one',
      title: 'Research One',
      summary: 's',
      description: 'd',
      highlights: [],
      tags: [],
      tech: [],
      date: '2025-01',
    },
  ],
  experience: [
    {
      id: 'acme',
      company: 'Acme',
      role: 'Engineer',
      type: 'Full-time',
      location: 'Mumbai',
      start: '2026-04',
      highlights: ['Did things'],
      tech: [],
    },
  ],
  skillGroups: [{ id: 'languages', title: 'Languages', skills: [{ name: 'Java' }] }],
  education: [{ id: 'uni', institution: 'Uni', degree: 'B.Tech', location: 'Mumbai', end: '2026' }],
};

export const fixtureEnv: TerminalEnv = {
  effects: { scanlines: true, glitch: true, bloom: true, '3d': true },
  palettes: ['cyberpunk', 'matrix'],
  palette: 'cyberpunk',
  history: [],
};

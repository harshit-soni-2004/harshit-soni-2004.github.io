import type { Certification, Education } from './types';

export const education: Education[] = [
  {
    id: 'djsce',
    institution: 'Dwarkadas J. Sanghvi College of Engineering',
    degree: 'B.Tech in Information Technology',
    location: 'Mumbai, India',
    start: '2022',
    end: '2026',
    score: 'CGPA 7.6/10', // one older resume says 7.5 — using the latest value
  },
  {
    id: 'khar-education-society',
    institution: 'Khar Education Society',
    degree: 'Higher Secondary School Certificate (HSC)',
    location: 'Mumbai, India',
    start: '2020',
    end: '2022',
    score: '78%',
  },
  {
    id: 'utpal-sanghvi',
    institution: 'Utpal Sanghvi Global School',
    degree: 'Secondary School Certificate (SSC)',
    location: 'Mumbai, India',
    end: '2020',
    score: '85%',
  },
];

/**
 * TODO: No certifications were listed in the resumes. Add them here, e.g.
 * { id: 'aws-saa', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2026-01', url: 'https://...' },
 * The Certifications block is hidden automatically while this array is empty.
 */
export const certifications: Certification[] = [];

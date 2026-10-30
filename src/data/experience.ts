import type { Experience } from './types';

/** Rendered newest-first as a `git log` style timeline. Omit `end` for current roles. */
export const experience: Experience[] = [
  {
    id: 'veefin',
    company: 'Veefin',
    role: 'Software Engineer',
    type: 'Full-time',
    location: 'Mumbai, India',
    start: '2026-04',
    end: '2026-10',
    highlights: [
      'Worked directly with the CTO to design and build an internal task manager for the engineering team, replacing Jira and eliminating its recurring licence cost.',
      'Patched the CIS-hardened AlmaLinux 9 golden AMI (9.4 → 9.8): High/Critical findings 9,305 → 4,380 and Critical 7 → 0. A later cycle traced 4,387 findings to stale kernel packages and took OS-package findings to 0. Wrote the weekly patching runbook.',
      "Built the company's first CIS-hardened arm64 AMI for Graviton: ported auditd rules to aarch64, patched to 0 Critical, and fixed a cross-region copy failure caused by an inherited AWS Marketplace product code.",
      'Turned the arm64 image into an Amazon EKS 1.32 worker AMI (containerd, kubelet, nodeadm); root-caused a three-part boot failure including a systemd ordering loop, and patched AWS nodeadm to accept AlmaLinux.',
      'Wrote reusable Terraform modules (S3, EC2, RDS) enforcing encryption, IMDSv2 and private networking; modeled a multi-tier reference architecture with 2 ALBs and ~60 least-privilege security-group rules.',
      'Stood up a Docker Compose environment for a 15-service Spring Boot platform, onboarding 6 services plus Redis and RabbitMQ with a repeatable runbook; recovered Flyway migrations to schema V44 without data loss.',
      'Fixed service startup failures (Jasypt-encrypted config, JWT key paths, RabbitMQ vhosts, container log permissions); set up RSA JWT verification with read-only mounted keys and replaced a full-admin MySQL account with schema-scoped grants.',
      'Root-caused failing Bitbucket Pipelines builds on self-hosted runners (ANSI colour codes captured into an artifact version, rsync permission errors) and added a diagnostic pipeline.',
      'Delivered 76 commits (42 Spring Boot, 34 Angular) on a collateral-management module: fixed-deposit lien fields, valuer-expiry rules, save-as-draft flows and form validation.',
    ],
    tech: [
      'AWS',
      'Terraform',
      'EKS',
      'Docker',
      'AlmaLinux',
      'Trivy',
      'Bitbucket Pipelines',
      'Java 21',
      'Spring Boot',
      'Angular',
      'MySQL',
      'RabbitMQ',
      'Redis',
    ],
  },
  {
    id: 'transactbox',
    company: 'TransactBox',
    role: 'Software Developer Intern',
    type: 'Internship',
    location: 'Mumbai, India',
    // TODO: one resume says Dec 2025 – Present, the newer ones say Jan 2026 – Apr 2026. Confirm.
    start: '2026-01',
    end: '2026-04',
    highlights: [
      'Replaced hardcoded business logic with database-driven configuration using Spring Boot and JPA.',
      'Designed and built admin-controlled filter management with REST APIs, enabling real-time updates without redeployment.',
      'Integrated services through Spring Cloud Gateway and Eureka in a microservices architecture.',
      'Resolved production issues in API routing, context paths and UUID-based persistence.',
    ],
    tech: ['Java', 'Spring Boot', 'JPA', 'Spring Cloud Gateway', 'Eureka', 'REST'],
  },
  {
    id: 'dj-init-ai',
    company: 'DJ InIT.AI',
    role: 'Junior Research Lead',
    type: 'Leadership & Research',
    location: 'Mumbai, India',
    start: '2024-08',
    // end: 'YYYY-MM', // TODO: set when the role ends
    highlights: [
      'Organized 5+ technical workshops with participation from 100+ students.',
      'Contributed to cross-lingual NLP research resulting in a paper accepted at ICCDS 2025.',
    ],
    tech: ['NLP', 'Python', 'Machine Learning'],
  },
];

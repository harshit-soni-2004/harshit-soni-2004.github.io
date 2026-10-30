/**
 * Content model for the whole site.
 *
 * Every section, the terminal, filters, counts and deep links read from objects that satisfy
 * these interfaces. If you add a field with a typo, or forget a required one, `npm run build`
 * (tsc) will fail and point at the exact line.
 */

/** URL-safe identifier, used for deep links (#/projects/<id>) and `open <id>` in the terminal. */
export type Id = string;

/** ISO-ish date string: 'YYYY-MM' or 'YYYY-MM-DD'. Used for sorting. */
export type DateString = string;

export interface SocialLink {
  /** Shown in UI and used by the `contact` command. */
  label: string;
  url: string;
  /** Short handle text, e.g. 'HarshitSoni531'. */
  handle: string;
}

export interface Profile {
  name: string;
  /** Short handle used in the prompt, e.g. `harshit@portfolio:~$`. */
  handle: string;
  /** Rotating titles in the hero typing animation. */
  titles: string[];
  tagline: string;
  /** Paragraphs for the About section. */
  bio: string[];
  location: string;
  email: string;
  phone?: string;
  /** Availability note, e.g. 'Immediate joiner'. */
  availability?: string;
  /** Path relative to /public, e.g. 'resume/Harshit_Soni_Resume.pdf'. */
  resumePath: string;
  socials: SocialLink[];
  /** Short list of non-technical interests for the About section. */
  interests?: string[];
}

export interface Project {
  id: Id;
  title: string;
  /** One line, shown on the card. */
  summary: string;
  /** Longer paragraph, shown in the modal. */
  description: string;
  /** Impact-focused bullets, shown in the modal. */
  highlights: string[];
  /** Filter tags, e.g. 'DevOps', 'SDE', 'ML'. Case-insensitive in the terminal. */
  tags: string[];
  /** Tech stack chips. */
  tech: string[];
  github?: string;
  demo?: string;
  /** Path relative to /public or absolute URL. */
  image?: string;
  /** Alt text for `image`. Required for accessibility if an image is set. */
  imageAlt?: string;
  /** Optional video (mp4/webm) path or URL. */
  video?: string;
  /** Featured projects are sorted first. */
  featured?: boolean;
  date: DateString;
  /** Context such as employer or 'Personal'. */
  context?: string;
}

export interface Paper {
  id: Id;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  pdf?: string;
  doi?: string;
  arxiv?: string;
  /** Publisher page, e.g. the IEEE Xplore record. */
  url?: string;
  /** Screenshot of the paper / publisher page. Path relative to /public or absolute URL. */
  image?: string;
  imageAlt?: string;
  /** Page range in the proceedings, e.g. '1-6'. */
  pages?: string;
  /** Raw BibTeX entry for the Copy BibTeX button. */
  bibtex?: string;
  tags: string[];
  /** e.g. 'Published', 'Accepted', 'Under review'. */
  status?: string;
}

export interface ResearchProject {
  id: Id;
  title: string;
  summary: string;
  description: string;
  highlights: string[];
  tags: string[];
  tech: string[];
  /** e.g. 'DJ InIT.AI' or advisor / lab name. */
  affiliation?: string;
  github?: string;
  demo?: string;
  pdf?: string;
  /** Id of the paper this work was published as (links to it from the modal). */
  paper?: Id;
  /** Architecture diagram or screenshot. Path relative to /public or absolute URL. */
  image?: string;
  imageAlt?: string;
  date: DateString;
  status?: string;
}

/** One layer of the tech stack (frontend, backend, data, cloud, …). */
export interface StackLayer {
  id: Id;
  title: string;
  /** One line on what this layer does in my work. */
  blurb: string;
  /** Technology names, matched as whole words against project / research `tech` lists. */
  items: string[];
}

export interface Experience {
  id: Id;
  company: string;
  role: string;
  /** e.g. 'Full-time', 'Internship', 'Leadership'. */
  type: string;
  location: string;
  start: DateString;
  /** Omit for current roles. */
  end?: DateString;
  highlights: string[];
  tech: string[];
}

export interface SkillGroup {
  id: Id;
  title: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  /** Optional 0-100 self-assessed level. If omitted the skill renders as a tag only. */
  level?: number;
}

export interface Education {
  id: Id;
  institution: string;
  degree: string;
  location: string;
  start?: DateString;
  end: DateString;
  /** e.g. 'CGPA 7.6/10' or '85%'. */
  score?: string;
}

/** Theme colour token used as an object's accent (maps to a CSS --neon-* variable). */
export type ColorToken = 'cyan' | 'magenta' | 'green' | 'amber';

/** An interactive object floating in the 3D background. */
export interface SpaceObjectEntry {
  id: Id;
  /** Short hover label, e.g. 'Pass it!'. */
  label: string;
  type: 'station' | 'saucer' | 'ball' | 'rocket' | 'delorean' | 'falcon' | 'walle' | 'milano';
  color: ColorToken;
  /** Overall scale (1 ≈ 1.5 view units across). */
  size: number;
  /**
   * Start position: x / y as a fraction of the half-view (-1 = left/bottom edge, 1 = right/top),
   * z as distance from the camera in view units (larger = further away, ~8-16 works well).
   */
  start: [number, number, number];
  /** Drift speed multiplier (1 = default). */
  driftSpeed: number;
  tooltipTitle: string;
  tooltipText: string;
  enabled: boolean;
}

export interface Certification {
  id: Id;
  name: string;
  issuer: string;
  date: DateString;
  url?: string;
}

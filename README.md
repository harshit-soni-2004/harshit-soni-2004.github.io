# harshit@portfolio:~$

Personal portfolio of **Harshit Soni**: a "Terminal Cyberpunk" site built with Vite, React 18, TypeScript and React Three Fiber. It has a neon wireframe terrain, glitch headings, a boot sequence, and a real command line (`help`, `projects --tag devops`, `open spendsense`, …).

All content lives in typed data files. **Add one object to an array and the cards, filters, terminal commands, stats, modals and deep links all update.**

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script            | What it does                                                                    |
| ----------------- | ------------------------------------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                                                      |
| `npm run build`   | Type-check (`tsc -b`) and build static files to `dist/`                         |
| `npm run preview` | Serve the production build locally                                              |
| `npm test`        | Vitest unit tests (command parser, autocomplete, content validation)            |
| `npm run lint`    | ESLint                                                                          |
| `npm run format`  | Prettier                                                                        |
| `npm run images`  | Re-render `public/og-image.png` + `apple-touch-icon.png` with local Chrome/Edge |

Requires Node 20+.

---

## Folder structure

```
public/                 favicon, og-image.png, resume/Harshit_Soni_Resume.pdf, papers/
scripts/                OG image template + generator (npm run images)
src/
  data/                 ← ALL CONTENT LIVES HERE
    types.ts            interfaces for every entry (TypeScript flags typos / missing fields)
    profile.ts          name, titles, bio, links, resume path
    projects.ts         Project[]
    research.ts         papers: Paper[], researchProjects: ResearchProject[]
    experience.ts       Experience[]
    skills.ts           SkillGroup[]
    education.ts        Education[], certifications
    validate.ts         dev-time checks (duplicate ids, date format, alt text)
    index.ts            derived data: sorted projects, tag list, stats
  terminal/             pure, unit-tested command parser / executor / autocomplete
  three/                R3F scene: terrain shader, particles, camera rig, bloom, skill sphere
  components/           command bar, terminal pane, modal, glitch text, boot sequence, …
  sections/             Hero, About, Projects, Research, Experience, Skills, Contact
  hooks/                hash router, reduced motion, performance tier, focus trap, …
  state/store.ts        Zustand store (effects, palette, terminal, filters, route)
  config/theme.ts       palettes, effect defaults, 3D quality presets
  config/site.ts        site URL + asset() helper for the GitHub Pages base path
  styles/variables.css  ← COLOURS LIVE HERE
```

---

## Adding content

Open the matching file in `src/data/`, add an object, and save. TypeScript will underline missing or misspelled fields. In dev mode, `validate.ts` logs a clear console error for duplicate ids or bad dates.

`id` must be **unique across projects, papers and research projects**, and must use lowercase letters, numbers and dashes. It is used for the deep link (`#/projects/<id>` or `#/research/<id>`) and for `open <id>` in the terminal.

### Add a project (`src/data/projects.ts`)

```ts
{
  id: 'my-new-project',
  title: 'My New Project',
  summary: 'One line shown on the card.',
  description: 'A paragraph shown in the detail modal.',
  highlights: [
    'Impact-focused bullet one.',
    'Impact-focused bullet two.',
  ],
  tags: ['DevOps', 'Cloud'],          // new tags automatically become filter chips + `projects --tag`
  tech: ['Terraform', 'AWS', 'Python'],
  github: 'https://github.com/HarshitSoni531/my-new-project', // optional
  demo: 'https://my-demo.example.com',                         // optional
  image: 'projects/my-new-project.png', // optional, put the file in public/projects/
  imageAlt: 'Architecture diagram of …', // required if image is set
  video: 'projects/demo.mp4',           // optional
  featured: true,                       // featured projects are listed first
  date: '2026-11',                      // YYYY-MM, used for sorting
  context: 'Personal',                  // e.g. employer, 'Personal', 'Hackathon'
},
```

### Add a paper (`src/data/research.ts` → `papers`)

```ts
{
  id: 'isl-detection-iccds25',
  title: 'Real-time Indian Sign Language Recognition …',
  authors: ['Harshit Soni', 'Co Author'], // your name is bolded automatically
  venue: 'ICCDS',
  year: 2025,
  abstract: 'Paste the abstract here.',
  pdf: 'papers/isl-detection.pdf',  // file in public/papers/ or a full URL
  doi: '10.1109/XXXX.2025.0000000', // just the DOI; the link is built for you
  arxiv: '2501.01234',              // just the id
  bibtex: `@inproceedings{soni2025isl,
  title     = {...},
  author    = {Soni, Harshit and ...},
  booktitle = {...},
  year      = {2025}
}`,
  tags: ['ML', 'Computer Vision'],
  status: 'Published',
},
```

### Add a research project (`src/data/research.ts` → `researchProjects`)

```ts
{
  id: 'cross-lingual-nlp',
  title: 'Cross-lingual NLP …',
  summary: 'One line for the card.',
  description: 'Problem, approach and outcome.',
  highlights: ['Key result.'],
  tags: ['NLP'],
  tech: ['Python', 'PyTorch'],
  affiliation: 'DJ InIT.AI',
  github: 'https://github.com/...', // optional
  pdf: 'papers/report.pdf',         // optional
  date: '2025-03',
  status: 'Completed',
},
```

### Other data

- **Experience** (`experience.ts`): `{ id, company, role, type, location, start: 'YYYY-MM', end?: 'YYYY-MM', highlights: [], tech: [] }`. Leave out `end` for a current role.
- **Skills** (`skills.ts`): groups of `{ name, level? }`. If you set `level` (0–100), the skill renders as a neon bar; otherwise it renders as a tag.
- **Education and certifications** (`education.ts`): the Certifications block appears automatically once the array has entries.
- **Resume**: replace `public/resume/Harshit_Soni_Resume.pdf`, or change `resumePath` in `profile.ts`.

### Open TODOs

Search the codebase for `TODO` to find everything that still needs your input: the 3 papers, the 2 research projects, GitHub and demo links, a few project dates, certifications, and the TransactBox dates (your resumes disagree).

---

## Theme and effects

- **Colours:** edit `src/styles/variables.css`. The `--neon-cyan`, `--neon-magenta`, `--neon-green` and `--color-bg` values drive the whole UI, and the 3D scene reads them at runtime.
- **Extra palettes:** add one to `palettes` in `src/config/theme.ts`. It shows up automatically in the **fx** menu and in `theme <name>`.
- **Effect defaults:** set `effectDefaults` in `theme.ts` (`scanlines`, `glitch`, `bloom`, `3d`). Visitors can toggle these in the **fx** menu or with `theme bloom off`, and their choice is saved in localStorage.
- **Boot sequence:** `bootConfig` in `theme.ts` (`enabled`, `durationMs`). It is shown once per browser session and skipped for deep links.
- **3D quality:** `sceneQuality` in `theme.ts` sets grid segments, particle count, FPS cap and max DPR for the high and low tiers.
- **Mouse sensitivity:** `pointerInteraction` in `theme.ts` (the `calm` default) and `pointerInteractionIntense` (`fx intense`) control the terrain lift, camera parallax and the space-object repel field. Each field is commented in the file: `amplitude`, `radius`, `smoothing`, `decay`, `parallaxStrength`, `maxSpeedInfluence`, `trailLength`, `clickWave`, plus `deadZonePx`, `idleDelay` and `panelDamping` (calmer over the panels listed in `calmPanels`). Visitors switch live with `fx calm|intense|off`. Shape details (trail throttling, glow, shockwave size) are in `terrainShape`. Pointer effects are always off on touch devices and with reduced motion.
- **Space objects:** entries live in `src/data/spaceObjects.ts`. Each entry sets `id`, `label`, `type` (`station`, `saucer` or `ball`), `color` (`cyan`, `magenta`, `green` or `amber`), `size`, `start`, `driftSpeed`, `tooltipTitle`, `tooltipText` and `enabled`. Adding a new object of an existing kind only takes a new entry:

  ```ts
  {
    id: 'ball-two',
    label: 'Header it!',
    type: 'ball',
    color: 'green',
    size: 0.6,
    start: [-0.6, -0.5, 10], // x/y: fraction of the half-view, z: distance from the camera
    driftSpeed: 1,
    tooltipTitle: 'ball-two.md',
    tooltipText: 'A second football.',
    enabled: true,
  },
  ```

  Tuning lives in `spaceObjects` in `theme.ts`: drift speed and amplitude, throw and spin damping, return delay and stiffness, repel radius and strength, max objects, kick strength and spin, launch speed, playground zoom, particle cap, and the low-power subset.

### Performance and accessibility behaviour

- The text content paints first. The Three.js scene is a separate lazy chunk that loads when the browser is idle.
- On phones, tablets and low-power devices (few cores, low memory or Data Saver), the site uses a coarser grid, no bloom, 30 fps and a lower DPR. DPR is capped at 2 on every device.
- Rendering stops while the tab is hidden (`frameloop="never"`).
- With `prefers-reduced-motion`, the site disables glitch, camera motion and terrain flow, and shows static titles.
- If WebGL is unavailable or crashes, a CSS gradient and grid background is used instead.
- Modals trap focus and close with Escape. The page has a skip link and visible focus rings, and the terminal output is an `aria-live` log.

---

## Terminal commands

`help`, `about`, `projects [--tag <tag>] [--search <q>] [--featured]`, `research`, `open <id>`, `experience`, `skills [group]`, `education`, `contact`, `resume`, `theme [palette | <effect> on|off]`, `fx [calm|intense|off]`, `play`, `exit`, `spawn <ship|saucer|ball>`, `kick`, `launch`, `reset`, `ls`, `cd <section>`, `history`, `clear`.

**Playground mode** (`play`, the `./play` nav button or the **P** key; leave with Esc or `exit`) fades the panels, lets the 3D layer take the pointer and shows a keyboard toolbar. In it:

- Drag an object to rotate it; Shift+drag (or "move mode") moves and throws it.
- Click an object for its reaction; double-click (or select it in the toolbar and press Enter) for its info card.

Outside playground mode, objects can still be clicked wherever the canvas shows between panels.

Press `/` or `Ctrl+K` to focus the command bar. Tab autocompletes commands, ids, tags and theme options, and ↑/↓ browse history. Every link and button works without typing, so the terminal is optional.

---

## Deploy

### GitHub Pages (recommended, free)

1. Create a GitHub repo (for example `portfolio`) and push this folder to its `main` branch:
   ```bash
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/HarshitSoni531/portfolio.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` lints, tests, builds and deploys on every push to `main`. The site will be at `https://harshitsoni531.github.io/portfolio/`.

**About `base`:** GitHub Pages serves project repos from `/<repo>/`, so Vite needs `base: '/<repo>/'`. `vite.config.ts` reads it from the `BASE_PATH` environment variable, and the workflow sets it for you:

| Repo name                  | URL                                           | `BASE_PATH`                           |
| -------------------------- | --------------------------------------------- | ------------------------------------- |
| `portfolio`                | `https://harshitsoni531.github.io/portfolio/` | `/portfolio/`                         |
| `HarshitSoni531.github.io` | `https://harshitsoni531.github.io/`           | `/`                                   |
| Custom domain              | `https://harshitsoni.dev/`                    | `/` (set repo variable `BASE_PATH=/`) |

To build for Pages locally: `BASE_PATH=/portfolio/ npm run build` (in PowerShell: `$env:BASE_PATH='/portfolio/'; npm run build`).

Also set **`VITE_SITE_URL`** in `.env`, or the `SITE_URL` repo variable, to your public URL. Open Graph previews on LinkedIn need absolute image URLs. The workflow fills it in automatically for `github.io` URLs.

Routing is hash-based (`#/projects/spendsense`), so deep links work on Pages without any 404 redirect tricks.

### Vercel / Netlify

Import the repo. The framework is **Vite**, the build command is `npm run build`, and the output directory is `dist`. Leave `BASE_PATH` unset (the site is served from `/`), and add the environment variable `VITE_SITE_URL=https://<your-app>.vercel.app` (or your Netlify URL) so the OG tags are correct.

---

## Linking from LinkedIn and GitHub

After you deploy, paste the URL into [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). That refreshes LinkedIn's cache and shows the preview card generated from `og-image.png`.

**LinkedIn: Featured section**

1. On your profile, go to **Add profile section → Recommended → Add featured → Add a link**.
2. Paste `https://harshitsoni531.github.io/portfolio/`. The title, description and image are picked up from the OG tags.
3. To feature a single project, add a deep link such as `https://harshitsoni531.github.io/portfolio/#/projects/spendsense`.

**LinkedIn: Contact info**

1. Click **Edit intro → Contact info → Website → Add website**.
2. Paste the URL and choose type **Portfolio**.
3. Optionally add it to your headline or About section, e.g. `Portfolio: harshitsoni531.github.io/portfolio`.

**GitHub profile README**

Create a public repo named exactly `HarshitSoni531` with a `README.md`. GitHub shows it on your profile. For example:

```md
### Hi, I'm Harshit 👋

DevOps / Cloud Engineer · Full-stack (Java, Spring Boot, Angular) · Researcher

[![Portfolio](https://img.shields.io/badge/portfolio-harshitsoni531.github.io-00f0ff?style=for-the-badge&logo=gnometerminal&logoColor=white&labelColor=05070a)](https://harshitsoni531.github.io/portfolio/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-harshitsoni-ff2bd6?style=for-the-badge&logo=linkedin&labelColor=05070a)](https://www.linkedin.com/in/harshitsoni)

[![Portfolio preview](https://harshitsoni531.github.io/portfolio/og-image.png)](https://harshitsoni531.github.io/portfolio/)
```

Also add the URL to the **Website** field of your GitHub profile (Settings → Public profile) and to the portfolio repo's **About → Website** box.

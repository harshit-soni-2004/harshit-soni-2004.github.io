/**
 * Renders scripts/og-image.html → public/og-image.png and scripts/icon.html →
 * public/apple-touch-icon.png using a locally installed Chrome / Edge in headless mode.
 * No npm dependencies. Set CHROME_PATH to override browser detection.
 *
 *   npm run images
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chrome/Edge found. Set CHROME_PATH to a Chromium-based browser.');
  process.exit(1);
}

const jobs = [
  { src: 'scripts/og-image.html', out: 'public/og-image.png', size: '1200,630' },
  { src: 'scripts/icon.html', out: 'public/apple-touch-icon.png', size: '180,180' },
];

for (const job of jobs) {
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--virtual-time-budget=2000',
    `--window-size=${job.size}`,
    `--screenshot=${resolve(root, job.out)}`,
    pathToFileURL(resolve(root, job.src)).href,
  ]);
  console.log(`✓ ${job.out}`);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM' → 'Apr 2026', 'YYYY' → '2026'. */
export function formatMonth(date: string): string {
  const [year, month] = date.split('-');
  if (!month) return year ?? date;
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : date;
}

export function formatRange(start: string | undefined, end: string | undefined): string {
  const s = start ? formatMonth(start) : '';
  const e = end ? formatMonth(end) : 'Present';
  return s ? `${s} — ${e}` : e;
}

/** Deterministic short hex "commit hash" for an id (FNV-1a). Purely decorative. */
export function shortHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

/** Levenshtein distance, used for "did you mean" suggestions. */
export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0] as number;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j] as number;
      dp[j] = Math.min(
        (dp[j] as number) + 1,
        (dp[j - 1] as number) + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return dp[b.length] as number;
}

export function closest(input: string, candidates: string[], maxDistance = 3): string | undefined {
  let best: string | undefined;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(input.toLowerCase(), c.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return bestDist <= maxDistance ? best : undefined;
}

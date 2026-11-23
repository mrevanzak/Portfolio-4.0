export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  label: string;
  count: number;
  level: ContributionLevel;
  row: number;
  col: number;
}

export interface GithubContributions {
  username: string;
  profileUrl: string;
  total: number;
  weeks: number;
  days: ContributionDay[];
}

const DEFAULT_USERNAME = "mrevanzak";
const FETCH_TIMEOUT_MS = 5000;
const cache = new Map<string, Promise<GithubContributions>>();

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
});

export function formatDateLabel(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? isoDate : dateFormatter.format(parsed);
}

export function formatContributionCount(count: number): string {
  if (count === 0) return "No contributions";
  return `${count.toLocaleString("en-US")} ${count === 1 ? "contribution" : "contributions"}`;
}

export function formatDayAriaLabel(count: number, dateLabel: string): string {
  return `${formatContributionCount(count)} on ${dateLabel}`;
}

export function assignQuantileLevels(days: ContributionDay[]) {
  const positive = days
    .map((day) => day.count)
    .filter((count) => count > 0)
    .sort((a, b) => a - b);

  if (positive.length === 0) return;

  const at = (p: number) => positive[Math.min(positive.length - 1, Math.floor(positive.length * p))];
  const q1 = at(0.38);
  const q2 = at(0.72);
  const q3 = at(0.955);

  for (const day of days) {
    if (day.count <= 0) day.level = 0;
    else if (day.count <= q1) day.level = 1;
    else if (day.count <= q2) day.level = 2;
    else if (day.count <= q3) day.level = 3;
    else day.level = 4;
  }
}

export function normalizeApiContributions(
  entries: Array<{ date: string; count: number; level: number }>,
  totalFromApi?: number
): { total: number; days: ContributionDay[] } | null {
  if (!entries.length) return null;

  const first = new Date(`${entries[0].date}T00:00:00Z`);
  if (Number.isNaN(first.getTime())) return null;
  const firstMs = first.getTime();
  const firstDow = first.getUTCDay();

  const days: ContributionDay[] = [];
  for (const entry of entries) {
    const current = new Date(`${entry.date}T00:00:00Z`);
    if (Number.isNaN(current.getTime())) continue;
    const offset = firstDow + Math.round((current.getTime() - firstMs) / 86_400_000);
    if (offset < 0) continue;
    days.push({
      date: entry.date,
      label: formatDateLabel(entry.date),
      count: Number(entry.count) || 0,
      level: Math.min(4, Math.max(0, Number(entry.level) || 0)) as ContributionLevel,
      row: offset % 7,
      col: Math.floor(offset / 7)
    });
  }

  if (!days.length) return null;
  days.sort((a, b) => a.col - b.col || a.row - b.row);
  assignQuantileLevels(days);

  const sum = days.reduce((acc, day) => acc + day.count, 0);
  return {
    total: typeof totalFromApi === "number" && totalFromApi >= 0 ? totalFromApi : sum,
    days
  };
}

function parseContributionsHtml(html: string, username: string): GithubContributions | null {
  const tooltips = new Map<string, number>();
  const tooltipRegex = /<tool-tip[^>]+for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]+)<\/tool-tip>/g;

  for (const match of html.matchAll(tooltipRegex)) {
    const [, id, text] = match;
    const countMatch = text.trim().match(/^([\d,]+)\s+contribution/i);
    tooltips.set(id, countMatch ? Number(countMatch[1].replace(/,/g, "")) : 0);
  }

  const days: ContributionDay[] = [];
  const cellRegex = /<td\b[^>]*\bdata-date="([^"]+)"[^>]*>/g;

  for (const match of html.matchAll(cellRegex)) {
    const tag = match[0];
    const date = match[1];
    const idMatch = tag.match(/\bid="(contribution-day-component-(\d+)-(\d+))"/);
    const levelMatch = tag.match(/\bdata-level="([0-4])"/);
    if (!idMatch || !levelMatch) continue;

    const [, id, rowStr, colStr] = idMatch;
    const row = Number(rowStr);
    const col = Number(colStr);
    const rawLevel = Number(levelMatch[1]) as ContributionLevel;
    const count = tooltips.get(id) ?? 0;

    days.push({
      date,
      label: formatDateLabel(date),
      count,
      level: rawLevel,
      row,
      col
    });
  }

  if (days.length === 0) return null;

  days.sort((a, b) => a.col - b.col || a.row - b.row);

  if (tooltips.size > 0) {
    assignQuantileLevels(days);
  }

  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i);
  const sum = days.reduce((acc, day) => acc + day.count, 0);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : sum;
  const weeks = Math.max(...days.map((day) => day.col)) + 1;

  return {
    username,
    profileUrl: `https://github.com/${username}`,
    total,
    weeks,
    days
  };
}

function createFallbackContributions(username: string): GithubContributions {
  const weeks = 53;
  const days: ContributionDay[] = [];
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - ((weeks - 1) * 7 + start.getUTCDay()));

  for (let col = 0; col < weeks; col++) {
    for (let row = 0; row < 7; row++) {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + col * 7 + row);
      if (current > today) continue;
      const iso = current.toISOString().slice(0, 10);
      days.push({
        date: iso,
        label: formatDateLabel(iso),
        count: 0,
        level: 0,
        row,
        col
      });
    }
  }

  return {
    username,
    profileUrl: `https://github.com/${username}`,
    total: 0,
    weeks,
    days
  };
}

async function fetchContributions(username: string): Promise<GithubContributions> {
  try {
    const response = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "text/html",
        "User-Agent": "rvnza-portfolio-build"
      }
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const html = await response.text();
    const parsed = parseContributionsHtml(html, username);
    if (parsed) return parsed;
  } catch (error) {
    console.warn(`Failed to load GitHub contributions for ${username}`, error);
  }

  return createFallbackContributions(username);
}

export function getGithubContributions(username = import.meta.env.GITHUB_USERNAME ?? DEFAULT_USERNAME) {
  let pending = cache.get(username);
  if (!pending) {
    pending = fetchContributions(username);
    cache.set(username, pending);
  }
  return pending;
}

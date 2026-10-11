// GitHub activity for the GitHub section, fetched on the server only.
//
// - Contribution calendar: GitHub's own public calendar fragment
//   (github.com/users/<login>/contributions), the same markup the profile page
//   renders. No token needed. It shows what the public profile shows: private
//   contributions appear only if "Private contributions" is switched on.
// - Repo count and top language: the public REST API. GITHUB_TOKEN (optional,
//   server-only, no scopes needed) just raises the rate limit.
//
// Everything is cached for REVALIDATE seconds (stale-while-revalidate), and
// each part fails on its own: a missing piece renders as "—", never a guess.

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type GithubActivityData = {
  login: string;
  /** null when the calendar couldn't be loaded */
  calendar: {
    totalContributions: number;
    /** Oldest week first; each week Sunday → Saturday, null where the year starts/ends mid-week. */
    weeks: (ContributionDay | null)[][];
  } | null;
  publicRepos: number | null;
  topLanguage: string | null;
};

const REVALIDATE = 60 * 60 * 6;
const TIMEOUT = 5000;

const get = (url: string, headers: Record<string, string> = {}) =>
  fetch(url, {
    headers: { "User-Agent": "nitinverse.me", ...headers },
    signal: AbortSignal.timeout(TIMEOUT),
    next: { revalidate: REVALIDATE, tags: ["github"] },
  });

const apiHeaders = () => {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

// The fragment is a table: one <td> per day with id "contribution-day-component-<weekday>-<week>",
// data-date and data-level; each day's count is in a <tool-tip for="<that id>">.
export function parseContributions(html: string): GithubActivityData["calendar"] {
  const counts = new Map<string, number>();
  for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = text.match(/^([\d,]+) contributions?\b/);
    counts.set(id, n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const weeks: (ContributionDay | null)[][] = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const id = attr(tag, "id");
    const date = attr(tag, "data-date");
    const level = Number(attr(tag, "data-level"));
    const pos = id?.match(/^contribution-day-component-(\d)-(\d+)$/);
    if (!id || !date || !pos || !(level >= 0 && level <= 4)) continue;
    const [weekday, week] = [Number(pos[1]), Number(pos[2])];
    weeks[week] ??= Array.from({ length: 7 }, () => null);
    weeks[week][weekday] = { date, level: level as ContributionDay["level"], count: counts.get(id) ?? 0 };
  }

  const total = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  // anything unexpected means GitHub changed the markup: show the fallback, not a broken graph
  // (Array.from so holes in a sparse array count as missing weeks)
  if (!total || weeks.length < 50 || Array.from(weeks).some((w) => !w)) return null;

  return { totalContributions: Number(total[1].replace(/,/g, "")), weeks };
}

async function getCalendar(login: string) {
  try {
    const res = await get(`https://github.com/users/${encodeURIComponent(login)}/contributions`);
    return res.ok ? parseContributions(await res.text()) : null;
  } catch {
    return null;
  }
}

async function getRepoStats(login: string) {
  try {
    const user = encodeURIComponent(login);
    const [profileRes, reposRes] = await Promise.all([
      get(`https://api.github.com/users/${user}`, apiHeaders()),
      get(`https://api.github.com/users/${user}/repos?per_page=100&type=owner&sort=pushed`, apiHeaders()),
    ]);
    const profile = profileRes.ok ? ((await profileRes.json()) as { public_repos?: number }) : null;
    const repos = reposRes.ok ? ((await reposRes.json()) as { fork: boolean; language: string | null }[]) : null;

    // most common primary language across the user's own (non-fork) repos
    let topLanguage: string | null = null;
    if (Array.isArray(repos)) {
      const tally = new Map<string, number>();
      for (const repo of repos) {
        if (!repo.fork && repo.language) tally.set(repo.language, (tally.get(repo.language) ?? 0) + 1);
      }
      topLanguage = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    }

    return { publicRepos: typeof profile?.public_repos === "number" ? profile.public_repos : null, topLanguage };
  } catch {
    return { publicRepos: null, topLanguage: null };
  }
}

export async function getGithubActivity(login: string): Promise<GithubActivityData> {
  const [calendar, stats] = await Promise.all([getCalendar(login), getRepoStats(login)]);
  return { login, calendar, ...stats };
}

export const githubLogin = (profileUrl: string) => new URL(profileUrl).pathname.split("/").filter(Boolean)[0] ?? null;

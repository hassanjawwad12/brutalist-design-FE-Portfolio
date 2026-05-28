import { github, type Repo } from "@/data/github";

export interface LangCount {
  lang: string;
  count: number;
}

export interface GithubKpis {
  username: string;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: LangCount[];
  topRepo: Repo | null;
  mostRecent: Repo | null;
  fetchedAt: string | null;
}

// Aggregates are computed across ALL repos so the totals are honest, even though
// the UI only lists a curated top-N.
export function computeKpis(repos: Repo[] = github.repos): GithubKpis {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  const langMap = new Map<string, number>();
  for (const r of repos) {
    if (r.language) langMap.set(r.language, (langMap.get(r.language) ?? 0) + 1);
  }
  const languages = [...langMap.entries()]
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count);

  const topRepo = repos.reduce<Repo | null>(
    (best, r) => (!best || r.stars > best.stars ? r : best),
    null,
  );
  const mostRecent = repos.reduce<Repo | null>(
    (best, r) => (!best || r.updated > best.updated ? r : best),
    null,
  );

  return {
    username: github.username,
    totalRepos: repos.length,
    totalStars,
    totalForks,
    languages,
    topRepo,
    mostRecent,
    fetchedAt: github.fetchedAt,
  };
}

export function topRepos(n = 8, repos: Repo[] = github.repos): Repo[] {
  return [...repos]
    .sort((a, b) => b.stars - a.stars || b.updated.localeCompare(a.updated))
    .slice(0, n);
}

// Flat shape shared by the Go (WASM) and JS paths — Go marshals exactly this.
export interface CardData {
  username: string;
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: LangCount[];
  topName: string;
  topStars: number;
  topLang: string;
  recentName: string;
  recentDate: string;
}

export function kpisToCard(k: GithubKpis): CardData {
  return {
    username: k.username,
    totalRepos: k.totalRepos,
    totalStars: k.totalStars,
    totalForks: k.totalForks,
    languages: k.languages,
    topName: k.topRepo?.name ?? "—",
    topStars: k.topRepo?.stars ?? 0,
    topLang: k.topRepo?.language ?? "—",
    recentName: k.mostRecent?.name ?? "—",
    recentDate: k.mostRecent?.updated?.slice(0, 10) ?? "—",
  };
}

export interface KpiCardLine {
  text: string;
  accent: boolean; // amber frame vs green content
}

const RULE = 52;
const LANG_PAD = 18;
const BAR_W = 12;

const rule = (corner: string, label: string): string => {
  const head = label ? `${corner}─ ${label} ` : corner;
  return head + "─".repeat(Math.max(0, RULE - head.length));
};

// A framed, left-rail "report card" for the terminal.
export function renderKpiCard(
  c: CardData,
  opts: { source: string; live: boolean },
): KpiCardLine[] {
  const lines: KpiCardLine[] = [];
  const A = (text: string) => lines.push({ text, accent: true });
  const G = (text: string) => lines.push({ text, accent: false });

  A(rule("┌", `github.com/${c.username} · ${opts.live ? "live" : "cached"}`));
  G("│");
  G(`│  repos ${c.totalRepos}    ·    stars ${c.totalStars}    ·    forks ${c.totalForks}`);
  G("│");

  const max = c.languages[0]?.count ?? 1;
  for (const l of c.languages.slice(0, 6)) {
    const filled = Math.max(1, Math.round((l.count / max) * BAR_W));
    const bar = "▮".repeat(filled) + "▯".repeat(BAR_W - filled);
    G(`│  ${l.lang.padEnd(LANG_PAD)}${bar} ${l.count}`);
  }

  G("│");
  G(`│  ★ top     ${c.topName} (${c.topStars}★, ${c.topLang})`);
  G(`│  ⟳ recent  ${c.recentName} · ${c.recentDate}`);
  G("│");
  A(rule("└", opts.source));
  return lines;
}

interface GhApiRepo {
  name?: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  html_url?: string;
  updated_at?: string;
  fork?: boolean;
  private?: boolean;
  topics?: string[];
}

// Live runtime fetch (browser) of the owner's public repos. Returns null on any
// failure so the caller can fall back to the committed build-time snapshot.
export async function fetchLiveRepos(): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${github.username}/repos?per_page=100&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) return null;
    const raw = (await res.json()) as GhApiRepo[];
    if (!Array.isArray(raw)) return null;
    return raw
      .filter((r) => !r.fork && !r.private)
      .map((r) => ({
        name: String(r.name ?? ""),
        description: r.description ?? "",
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        url: String(r.html_url ?? ""),
        updated: String(r.updated_at ?? ""),
        topics: Array.isArray(r.topics) ? r.topics.slice(0, 6) : [],
      }))
      .sort((a, b) => b.stars - a.stars || b.updated.localeCompare(a.updated));
  } catch {
    return null;
  }
}

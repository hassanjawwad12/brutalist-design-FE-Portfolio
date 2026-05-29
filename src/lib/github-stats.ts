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

  return {
    username: github.username,
    totalRepos: repos.length,
    totalStars,
    totalForks,
    languages,
  };
}

export function topRepos(n = 8, repos: Repo[] = github.repos): Repo[] {
  return [...repos]
    .sort((a, b) => b.stars - a.stars || b.updated.localeCompare(a.updated))
    .slice(0, n);
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
    const raw: unknown = await res.json();
    if (!Array.isArray(raw)) return null;
    return raw
      .filter((r): r is GhApiRepo => typeof r === "object" && r !== null)
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

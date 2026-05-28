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

// Terminal-friendly KPI lines (the caller appends a source/provenance label).
export function formatKpiLines(k: GithubKpis): string[] {
  const langs = k.languages
    .slice(0, 6)
    .map((l) => `${l.lang} ${l.count}`)
    .join(" · ");
  return [
    `@${k.username} — public repos: ${k.totalRepos} · stars: ${k.totalStars} · forks: ${k.totalForks}`,
    `languages: ${langs}`,
    k.topRepo
      ? `top repo:    ${k.topRepo.name} (${k.topRepo.stars}★, ${k.topRepo.language ?? "—"})`
      : "",
    k.mostRecent
      ? `most recent: ${k.mostRecent.name} (${k.mostRecent.updated.slice(0, 10)})`
      : "",
  ].filter(Boolean);
}

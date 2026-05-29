"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { computeKpis, topRepos } from "@/lib/github-stats";
import { useLiveGithub } from "@/hooks/useLiveGithub";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function GithubApp() {
  const { repos, live } = useLiveGithub();
  const kpis = useMemo(() => computeKpis(repos), [repos]);
  const top = useMemo(() => topRepos(5, repos), [repos]);
  const maxLang = kpis.languages[0]?.count ?? 1;

  return (
    <div className="app gh">
      <div className="gh__head">
        <p className="app__eyebrow">@{kpis.username}</p>
        <span className="gh__live" data-live={live || undefined}>
          {live ? "live" : "cached"}
        </span>
      </div>

      <div className="gh__stats">
        <div className="gh__stat">
          <span className="gh__num">{kpis.totalRepos}</span>
          <span className="gh__lbl">repos</span>
        </div>
        <div className="gh__stat">
          <span className="gh__num">{kpis.totalStars}</span>
          <span className="gh__lbl">stars</span>
        </div>
        <div className="gh__stat">
          <span className="gh__num">{kpis.totalForks}</span>
          <span className="gh__lbl">forks</span>
        </div>
      </div>

      <section className="gh__section">
        <h3 className="app__eyebrow">Languages</h3>
        <ul className="gh__langs">
          {kpis.languages.slice(0, 6).map((l) => (
            <li key={l.lang} className="gh__lang">
              <span className="gh__lang-name">{l.lang}</span>
              <span className="gh__bar">
                <span
                  className="gh__bar-fill"
                  style={{ "--fill": l.count / maxLang } as CSSProperties}
                />
              </span>
              <span className="gh__lang-count">{l.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="gh__section">
        <h3 className="app__eyebrow">Top repositories</h3>
        <ul className="gh__repos">
          {top.map((r) => (
            <li key={r.name} className="gh__repo">
              <ExternalLink href={r.url} className="gh__repo-name">
                {r.name}
              </ExternalLink>
              {r.description && <p className="gh__repo-desc">{r.description}</p>}
              <div className="gh__repo-meta">
                {r.language && <span>{r.language}</span>}
                <span>★ {r.stars}</span>
                <span>⑂ {r.forks}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

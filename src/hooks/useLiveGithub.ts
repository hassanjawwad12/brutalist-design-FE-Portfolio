"use client";

import { useEffect, useState } from "react";
import { fetchLiveRepos } from "@/lib/github-stats";
import { github, type Repo } from "@/data/github";

// Session cache so reopening the GitHub window doesn't re-hit the (unauthenticated,
// rate-limited at 60/hr) API — the first successful fetch is reused thereafter.
let cachedRepos: Repo[] | null = null;

interface LiveGithub {
  repos: Repo[];
  /** true once live data has replaced the build-time snapshot. */
  live: boolean;
}

/**
 * Stale-while-revalidate for GitHub repos: returns the committed snapshot
 * immediately (already in the bundle, so the first paint has real numbers), then
 * revalidates against the live API once per session and swaps the fresh result
 * in. Falls back silently to the snapshot if the request fails.
 */
export function useLiveGithub(): LiveGithub {
  const [repos, setRepos] = useState<Repo[]>(cachedRepos ?? github.repos);
  const [live, setLive] = useState(cachedRepos !== null);

  useEffect(() => {
    if (cachedRepos) return;
    let cancelled = false;
    fetchLiveRepos().then((fresh) => {
      if (!cancelled && fresh && fresh.length > 0) {
        cachedRepos = fresh;
        setRepos(fresh);
        setLive(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { repos, live };
}

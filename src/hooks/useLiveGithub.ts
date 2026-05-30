"use client";

import { useEffect, useState } from "react";
import { fetchLiveRepos } from "@/lib/github-stats";
import { github, type Repo } from "@/data/github";

// Session caches. `cachedRepos` holds the first successful live result; `inflight`
// dedupes concurrent mounts (the GitHub app renders in both the desktop window and
// the hidden mobile stack) into a single API call — the endpoint is rate-limited.
let cachedRepos: Repo[] | null = null;
let inflight: Promise<Repo[] | null> | null = null;

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
    inflight ??= fetchLiveRepos();
    inflight.then((fresh) => {
      if (fresh && fresh.length > 0) cachedRepos = fresh;
      inflight = null;
      if (!cancelled && fresh && fresh.length > 0) {
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

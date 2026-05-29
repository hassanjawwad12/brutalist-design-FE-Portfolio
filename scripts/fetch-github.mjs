// Build-time fetch of the owner's public GitHub repos -> src/data/github.generated.json
// Runs in `prebuild`. On any failure (offline, rate-limited) it keeps the existing
// committed snapshot so the build never breaks.
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "github.generated.json");
const USERNAME = "hassanjawwad12";

async function main() {
  const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": `${USERNAME}-portfolio-build`,
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error("unexpected response");

  const repos = raw
    .filter((r) => !r.fork && !r.private)
    .map((r) => ({
      name: r.name,
      description: r.description ?? "",
      language: r.language ?? null,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      url: r.html_url,
      updated: r.updated_at,
      topics: Array.isArray(r.topics) ? r.topics.slice(0, 6) : [],
    }))
    .sort((a, b) => b.stars - a.stars || b.updated.localeCompare(a.updated));

  const payload = {
    username: USERNAME,
    fetchedAt: new Date().toISOString(),
    repos,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`[fetch-github] wrote ${repos.length} repos to github.generated.json`);
}

main().catch((err) => {
  const hasSnapshot = existsSync(OUT);
  console.warn(
    `[fetch-github] fetch failed (${err.message}); ${
      hasSnapshot ? "keeping existing snapshot" : "writing empty snapshot"
    }`,
  );
  if (!hasSnapshot) {
    writeFileSync(
      OUT,
      JSON.stringify({ username: USERNAME, fetchedAt: null, repos: [] }, null, 2) +
        "\n",
    );
  }
});

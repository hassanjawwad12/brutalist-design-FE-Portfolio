import generated from "./github.generated.json";

export interface Repo {
  name: string;
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  updated: string;
  topics: string[];
}

export interface GithubData {
  username: string;
  fetchedAt: string | null;
  repos: Repo[];
}

// Validate the build-time snapshot at module load rather than trusting a blind
// cast — a malformed github.generated.json then fails loudly instead of NPEing
// deep inside KPI computation.
function assertGithubData(v: unknown): asserts v is GithubData {
  if (
    typeof v !== "object" ||
    v === null ||
    typeof (v as GithubData).username !== "string" ||
    !Array.isArray((v as GithubData).repos)
  ) {
    throw new Error("github.generated.json has an unexpected shape");
  }
}

const raw: unknown = generated;
assertGithubData(raw);
export const github: GithubData = raw;

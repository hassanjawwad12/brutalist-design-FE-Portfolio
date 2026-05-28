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

export const github: GithubData = generated as GithubData;

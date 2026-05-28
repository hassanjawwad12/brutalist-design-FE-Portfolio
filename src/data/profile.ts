export interface Profile {
  name: string;
  shortName: string;
  role: string;
  location: string;
  availability: "available" | "selective" | "closed";
  tagline: string;
  bio: string;
  email: string;
  socials: {
    label: string;
    href: string;
    handle: string;
  }[];
}

export const profile: Profile = {
  name: "Muhammad Hassan Jawwad",
  shortName: "Hassan",
  role: "Software Engineer",
  location: "Pakistan · Remote",
  availability: "selective",
  tagline:
    "Building fast, opinionated interfaces in React, Next.js, and TypeScript.",
  bio:
    "I'm a software engineer focused on the frontend — I build fast, motion-rich web interfaces in React, Next.js, and TypeScript. I care about typography, latency budgets, and the small details that make software feel intentional. Backend work, when I reach for it, lives in Go.",
  email: "hassanjawwad12@gmail.com",
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/hassanjawwad12",
      handle: "@hassanjawwad12",
    },
    {
      label: "LinkedIn",
      href: "https://pk.linkedin.com/in/muhammad-hassan-jawwad-a47284269",
      handle: "muhammad-hassan-jawwad",
    },
  ],
};

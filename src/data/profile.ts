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
  role: "Frontend & Golang Engineer",
  location: "Pakistan · Remote",
  availability: "selective",
  tagline:
    "Building fast, opinionated interfaces and high-performance backends.",
  bio:
    "I design and engineer products end-to-end — refractive, motion-rich web experiences on the front, and quiet, fast Go services on the back. I care about typography, latency budgets, and the small details that make software feel intentional.",
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

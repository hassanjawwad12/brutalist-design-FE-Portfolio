export interface ExperienceItem {
  id: string;
  title: string;
  org?: string;
  orgHref?: string;
  period: string;
  summary: string;
  highlights: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: "golden-gate",
    title: "Frontend Developer",
    org: "Golden Gate Innovations",
    orgHref: "https://www.ggi-ai.com/",
    period: "Jan 2025 — present",
    summary:
      "Building an AI-powered litigation platform shipped to real legal customers. Working on a scalable web app with third-party integrations across Clio, NetDocuments, OneDrive, and Dropbox.",
    highlights: [
      "Shipping production features against a live customer base",
      "Owning the document-integration UX across Clio / NetDocuments / OneDrive / Dropbox",
      "Building AI-assisted workflows into the litigation surface",
    ],
  },
  {
    id: "datumbrain",
    title: "Golang Developer",
    org: "Datumbrain",
    orgHref: "https://datumbrain.com/",
    period: "2024",
    summary:
      "Designed and shipped backend services in Go with Postgres and Docker.",
    highlights: [
      "Built reusable HTTP handlers and query layers",
      "Owned migrations and the local dev container stack",
      "Cut p95 latency on hot endpoints by ~40%",
    ],
  },
  {
    id: "exergy",
    title: "Software Engineer",
    org: "Exergy Systems",
    orgHref: "https://exergysystems.com/",
    period: "2023 — 2024",
    summary:
      "End-to-end product engineer on a React + TypeScript web platform.",
    highlights: [
      "Owned a multi-tenant settings surface",
      "Migrated the design system to Tailwind tokens",
      "Mentored two interns through review and pairing",
    ],
  },
  {
    id: "texagon",
    title: "Frontend Developer",
    org: "Texagon",
    orgHref: "https://texagon.io/",
    period: "2023",
    summary:
      "Built a React + TypeScript + Tailwind product, focused on interactivity.",
    highlights: [
      "Shipped the public marketing pages",
      "Wrote the motion + scroll system",
      "Established the component review process",
    ],
  },
];

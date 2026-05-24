export interface Project {
  id: string;
  index: string;
  title: string;
  description: string;
  role: string;
  year: string;
  stack: string[];
  href: string;
  repo?: string;
  status: "live" | "case study" | "archived";
}

export const projects: Project[] = [
  {
    id: "task-rise",
    index: "01",
    title: "Task Rise GmbH",
    description:
      "Full-service agency platform for eCommerce, creators, and coaches. Built the marketing surface, motion system, and lead flow.",
    role: "Frontend lead",
    year: "2024",
    stack: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    href: "https://hassan.task-rise.pages.dev/",
    status: "live",
  },
  {
    id: "sudha",
    index: "02",
    title: "Sudha",
    description:
      "AI-powered yoga companion that personalises a transformative practice per user. Worked on the product surface and onboarding.",
    role: "Frontend engineer",
    year: "2024",
    stack: ["React", "TypeScript", "Vite", "Tailwind"],
    href: "https://www.sudha.app/",
    status: "live",
  },
  {
    id: "kassoma",
    index: "03",
    title: "Kassoma AI",
    description:
      "AI-powered language learning platform. Built reactive lesson surfaces and voice-driven UX micro-interactions.",
    role: "Frontend engineer",
    year: "2024",
    stack: ["React", "Vite", "Tailwind"],
    href: "https://www.kassoma.net/",
    status: "live",
  },
  {
    id: "event-mgmt",
    index: "04",
    title: "Event Management System",
    description:
      "Backend platform powering a leading events firm. Designed the schema and HTTP layer in Go, with Postgres + Docker.",
    role: "Backend engineer",
    year: "2023",
    stack: ["Go", "Postgres", "Docker"],
    href: "https://github.com/hassanjawwad12/event-management-system",
    repo: "https://github.com/hassanjawwad12/event-management-system",
    status: "case study",
  },
];

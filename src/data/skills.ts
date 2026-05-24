export interface Skill {
  id: string;
  label: string;
  group: "frontend" | "backend" | "data" | "tooling";
  weight: number; // 1..5 — drives the physics chip size
}

export const skills: Skill[] = [
  // frontend
  { id: "react", label: "React", group: "frontend", weight: 5 },
  { id: "nextjs", label: "Next.js", group: "frontend", weight: 5 },
  { id: "typescript", label: "TypeScript", group: "frontend", weight: 5 },
  { id: "tailwind", label: "Tailwind", group: "frontend", weight: 4 },
  { id: "framer", label: "Framer Motion", group: "frontend", weight: 3 },
  { id: "r3f", label: "React Three Fiber", group: "frontend", weight: 4 },
  { id: "gsap", label: "GSAP", group: "frontend", weight: 3 },
  { id: "vite", label: "Vite", group: "frontend", weight: 3 },

  // backend
  { id: "go", label: "Go", group: "backend", weight: 5 },
  { id: "postgres", label: "Postgres", group: "backend", weight: 4 },
  { id: "docker", label: "Docker", group: "backend", weight: 4 },
  { id: "rest", label: "REST APIs", group: "backend", weight: 4 },

  // data
  { id: "python", label: "Python", group: "data", weight: 3 },
  { id: "ml", label: "ML basics", group: "data", weight: 2 },

  // tooling
  { id: "git", label: "Git", group: "tooling", weight: 4 },
  { id: "linux", label: "Linux", group: "tooling", weight: 3 },
];

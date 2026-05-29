import type { ReactNode } from "react";

export type AppId =
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "github"
  | "testimonials"
  | "contact";

export interface WindowGeometry {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AppMeta {
  id: AppId;
  title: string;
  /** Hue (oklch) for the dock icon tile, for color variety. */
  hue: number;
  icon: ReactNode;
  /** Default desktop position + size (clamped into view on open). */
  geometry: WindowGeometry;
  /** Opens automatically on first load. */
  defaultOpen?: boolean;
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * Single source of truth for the desktop's "apps". The window manager, Dock, and
 * (Phase 4) the command palette all read from this list. Order drives the dock.
 */
export const APPS: AppMeta[] = [
  {
    id: "about",
    title: "About",
    hue: 285,
    geometry: { x: 64, y: 40, w: 360, h: 400 },
    defaultOpen: true,
    icon: (
      <Svg>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </Svg>
    ),
  },
  {
    id: "projects",
    title: "Projects",
    hue: 250,
    geometry: { x: 452, y: 88, w: 560, h: 500 },
    defaultOpen: true,
    icon: (
      <Svg>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" />
      </Svg>
    ),
  },
  {
    id: "github",
    title: "GitHub",
    hue: 150,
    geometry: { x: 1040, y: 56, w: 360, h: 440 },
    defaultOpen: true,
    icon: (
      <Svg>
        <path d="M8 9l-3 3 3 3" />
        <path d="M16 9l3 3-3 3" />
        <path d="M13.5 5l-3 14" />
      </Svg>
    ),
  },
  {
    id: "experience",
    title: "Experience",
    hue: 60,
    geometry: { x: 150, y: 120, w: 500, h: 460 },
    icon: (
      <Svg>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </Svg>
    ),
  },
  {
    id: "skills",
    title: "Skills",
    hue: 200,
    geometry: { x: 320, y: 96, w: 560, h: 420 },
    icon: (
      <Svg>
        <path d="M12 3l2.4 5.4L20 11l-5.6 2.6L12 19l-2.4-5.4L4 11l5.6-2.6z" />
      </Svg>
    ),
  },
  {
    id: "testimonials",
    title: "Testimonials",
    hue: 330,
    geometry: { x: 400, y: 150, w: 520, h: 380 },
    icon: (
      <Svg>
        <path d="M4 5h16v10H9l-5 4z" />
        <path d="M8 9h8M8 12h5" />
      </Svg>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    hue: 20,
    geometry: { x: 240, y: 170, w: 420, h: 360 },
    icon: (
      <Svg>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M4 7l8 6 8-6" />
      </Svg>
    ),
  },
];

export function getApp(id: AppId): AppMeta {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`Unknown app id: ${id}`);
  return app;
}

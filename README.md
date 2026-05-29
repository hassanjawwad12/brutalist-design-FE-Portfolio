# hassan@desktop — Liquid Glass portfolio

**Live → https://hassan-os-based-portfolio.netlify.app/**

> This is the **Liquid Glass / OS-desktop** edition of my portfolio. A sibling branch
> (`terminal-based-portfolio`) ships the same content as a working IDE + shell — this one
> is the polished, product-grade counterpart.

## Summary

A portfolio rendered as a tiny **operating system**. You land on a desktop: a vivid
gradient wallpaper, a top menu bar, a bottom dock, and translucent **Liquid Glass**
windows you can drag, focus, and close. Each window is an "app" — About, Projects,
Experience, Skills, GitHub, Testimonials, Contact. A **⌘K command palette** launches any
of them or jumps straight to an external link.

The aesthetic is **light Liquid Glass** (iOS 26 inspired): near-white frosted surfaces
with real depth — `backdrop-filter` blur + saturation, specular rims, layered highlights —
floating over a slow gradient mesh. No WebGL, no heavy animation libraries: glass and
motion are done with CSS and a little pointer-event JS, so the bundle stays small and the
interface stays snappy.

Built on **Next.js 16 · React 19 · TypeScript · Tailwind v4**, fully statically
prerendered, no backend. Live GitHub KPIs are snapshotted at build time and revalidated in
the browser (stale-while-revalidate).

## Data flow

- `scripts/fetch-github.mjs` runs in `prebuild`, snapshotting public repos →
  `src/data/github.generated.json` (falls back to the committed snapshot if offline).
- The home page is a **Server Component**: it computes GitHub KPIs from the snapshot and
  passes them into the client `<Desktop>` — real content in the first HTML, no fetch
  waterfall.
- On the client, `useLiveGithub` revalidates against the GitHub API and swaps in fresh
  numbers without layout shift.

## Project layout

```
scripts/fetch-github.mjs       # prebuild: snapshot GitHub → src/data/github.generated.json
src/
├── app/
│   ├── page.tsx               # Server: compute KPIs → <Desktop />
│   ├── layout.tsx             # fonts (Geist + Geist Mono), metadata, theme
│   ├── globals.css            # reset, base, wallpaper layer, responsive, reduced-motion
│   ├── simple/page.tsx        # plain semantic fallback (no JS) — SEO / a11y
│   ├── opengraph-image.tsx    # generated 1200×630 OG card
│   └── sitemap.ts · robots.ts
├── components/
│   ├── desktop/               # Desktop shell, window manager + state, MenuBar, Dock,
│   │                          # Wallpaper, Window chrome, CommandPalette (⌘K)
│   ├── apps/                  # window contents: About, Projects, Experience, Skills,
│   │                          # Github, Testimonials, Contact
│   └── ui/                    # GlassPanel primitive, AvailabilityDot, shared bits
├── data/                      # profile, projects, experience, skills, testimonials,
│   │                          # github.ts + github.generated.json
├── hooks/                     # useReducedMotion, useHotkeys, useDrag, useClock, useLiveGithub
├── lib/
│   ├── apps.ts                # app registry (id, title, icon, default geometry)
│   ├── github-stats.ts        # KPI computation + live repo fetch
│   ├── fuzzy.ts               # fuzzy ranking for the command palette
│   └── site.ts                # SITE_URL (env / Vercel-aware)
└── styles/tokens.css          # Liquid Glass design tokens (oklch palette, glass, type, motion)
```

```bash
npm install && npm run dev        # http://localhost:3000
npm run build && npm run start    # production (prebuild syncs GitHub data)
npm run sync:github               # refresh github.generated.json (GITHUB_TOKEN optional)
```

## Features & things you can do

- A draggable, focusable **window manager** with a top menu bar and a bottom dock — open,
  stack, focus, minimize, and close glass windows like a real desktop.
- A **⌘K command palette** with fuzzy search to launch any app or jump to GitHub, LinkedIn,
  email, or the resume — full keyboard control, no mouse required.
- **Live GitHub KPIs** — total stars, forks, language breakdown, and top repositories,
  snapshotted at build and revalidated live in the browser.
- A **weighted skills cloud** where chip size reflects depth, and a **Projects** window with
  a scroll-revealed case study.
- **Liquid Glass** surfaces with designed hover/focus/active states, a gradient-mesh
  wallpaper, and motion that respects `prefers-reduced-motion`.
- Responsive: the desktop metaphor collapses to a clean stacked-card scroll on mobile.
- A plain, accessible, **JavaScript-free** version of the site at `/simple`.

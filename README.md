# hassan@portfolio

**Live → https://hassan-terminal-portfolio.netlify.app/**

## Summary

A portfolio where the UI **is** a working VS Code / shell. You land inside an editor,
browse a virtual file tree, type real shell-style commands, and content opens as tabs.
Bio, projects, experience, resume, and contact are all files in a virtual filesystem —
reach any of them by clicking the explorer, running a terminal command, or the command palette.

Theme is a phosphor-green hacker terminal (CRT scanlines, BIOS boot screen). Built on
**Next.js 16 · React 19 · TypeScript · Tailwind v4**, statically prerendered, no backend.
Code highlighting uses **Shiki**; the 3D skills playground uses **three.js + Rapier (WASM)**;
live GitHub KPIs are computed by a **Go module compiled to WebAssembly**.

## Project layout

```
go/
└── main.go                  # GitHub KPI logic → compiled to public/go/portfolio.wasm
public/go/                   # portfolio.wasm + wasm_exec.js (committed; runs without Go)
scripts/fetch-github.mjs     # prebuild: snapshots GitHub data → src/data/github.generated.json
src/
├── app/
│   ├── page.tsx             # mounts the IDE
│   ├── simple/page.tsx      # plain semantic fallback (no JS)
│   ├── p/[...path]/page.tsx # one prerendered URL per file
│   ├── opengraph-image.tsx  # generated 1200×630 OG image
│   ├── sitemap.ts · robots.ts · globals.css
├── components/
│   ├── ide/                 # BootScreen, TitleBar, ActivityBar, SideBar, Explorer,
│   │                        # TabBar, EditorGroup, Panel, StatusBar, CommandPalette,
│   │                        # ShortcutsOverlay, VimModal, IdePortfolio, store.tsx
│   ├── terminal/            # Terminal, parser, commands
│   └── playground/          # SkillsPlayground + SkillsScene (three.js / Rapier)
├── data/                    # profile, projects, experience, skills, testimonials,
│   │                        # fs.ts (virtual filesystem), github.ts + github.generated.json
├── hooks/useHotkeys.ts      # global keybindings
└── lib/
    ├── fs.ts                # path resolution, listDir, grep, completions
    ├── fuzzy.ts             # fuzzy ranking + Levenshtein suggestions
    ├── markdown.tsx         # inline markdown renderer
    ├── highlighter.ts       # Shiki highlighter w/ custom phosphor theme
    ├── github-stats.ts      # GitHub KPI computation + live repo fetch
    ├── gowasm.ts            # loads & calls the Go WASM module
    └── site.ts              # SITE_URL (env / Vercel-aware)
```

```bash
npm install && npm run dev        # http://localhost:3000
npm run build && npm run start    # production (prebuild syncs GitHub data)
npm run sync:github               # refresh github.generated.json (GITHUB_TOKEN optional)
npm run build:wasm                # rebuild portfolio.wasm (requires Go)
```

## Features & things you can do

- **BIOS boot screen** — phosphor POST sequence on first visit (sessionStorage-gated, respects `prefers-reduced-motion`).
- **Explorer + tabs** — browse the file tree; drag to reorder tabs, split editor (`◧`), pin tabs. Live grep search in the sidebar.
- **Terminal** — persistent state machine with `localStorage` history and `Tab` autocomplete:
  `ls · cd · pwd · cat · open/code · tree · grep · whoami · contact · echo · date · history · clear · theme · git · vim · sudo`
  - `stats` / `gostats` — compute **live GitHub KPIs via Go→WASM**.
  - `play` — open the **interactive 3D skills playground** (three.js + Rapier physics).
  - `sudo hire-me`, `rm -rf /` and other easter eggs; unknown commands get a Levenshtein "did you mean…?".
- **Hotkeys** — `Cmd+P` quick-open, `Cmd+Shift+P` command palette, `Cmd+B` sidebar, `Cmd+J` panel, `Cmd+\` split, `Cmd+W` close, `Esc` dismiss. Press `?` for the shortcuts overlay.
- **File views** — markdown (Shiki-highlighted code), JSON tree, image viewer, PDF (resume) viewer, external `.url` confirm page, and an inline contact form.
- **Every file is a real URL** under `/p/…`, each with its own `<title>` + OpenGraph tags. `sitemap.xml` / `robots.txt` generated at build.
- **Accessibility** — full keyboard nav, ARIA tree/tablist/dialog/log roles, a JS-free `/simple` route, and reduced-motion support.
- **Responsive** — full IDE on desktop; the sidebar becomes a slide-over drawer on mobile.

## Link

**https://hassan-terminal-portfolio.netlify.app/**

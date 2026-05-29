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

- A fully themed, terminal-style code editor that boots with a retro BIOS sequence and renders my whole portfolio, bio, projects, experience, resume, and contact , as files you can open in tabs.
- Real GitHub data with live repository KPIs (stars, forks, top languages, most-recent activity), computed by a Go program compiled to WebAssembly that runs right in your browser.
- A built-in terminal that behaves like a real shell — list and change directories, read and open files, search across content, replay command history, and tab-complete commands and paths.
- Full keyboard control — quick-open, a command palette, sidebar and panel toggles, editor splits, and a shortcuts overlay let you drive the entire experience without a mouse.
- Extras: an interactive, physics-driven 3D skills playground, hidden terminal easter eggs, syntax-highlighted file previews, and a plain, accessible, JavaScript-free version of the site at `/simple`.

## Link

**https://hassan-terminal-portfolio.netlify.app/**

# Plan — Terminal / IDE-as-Portfolio

> A portfolio site where the UI **is** a working VS Code / shell. Visitors land inside an editor, browse the file tree, type commands, and projects open as tabs. The medium is the message: this is what an engineer's portfolio should look like.

References: [jasoet.dev](https://jasoet.dev), Dunked-style terminal sites, [terminal.shel.dev](https://terminal.shel.dev), [cmd.cooper.sh](https://cmd.cooper.sh).

---

## 1. Concept & Goals

### Core idea
- The entire site renders as a faithful VS Code clone running in the browser.
- A bottom-panel terminal accepts real shell-style commands (`ls`, `cd`, `cat`, `open`, `whoami`, `clear`, `theme`, `contact`, `help`).
- The **explorer** sidebar shows a real file tree where folders are portfolio sections and files are projects/posts/resume artifacts.
- Clicking any file (or running `open <path>`) opens it as a **tab** in the editor area. Multiple tabs, split view, close/drag/reorder.
- Status bar shows Git branch, line/col, encoding, theme, contact link.

### What this is NOT
- Not a real terminal emulator (no PTY, no arbitrary command execution).
- Not a code editor (read-only). No Monaco/CodeMirror required — we render syntax-highlighted content statically.
- Not a gimmick: every interaction must lead somewhere useful (a project, a doc, a contact form).

### Success criteria
- A recruiter who **never touches the terminal** can still navigate via mouse + sidebar and reach every piece of content in ≤ 3 clicks.
- A developer who **only uses the keyboard** can do everything via `Cmd+P`, `Cmd+Shift+P`, terminal commands, and arrow keys.
- LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-tier mobile.
- Site degrades gracefully on screens < 768px: collapses to a simplified "mobile editor" layout (single panel, swipe between tabs).

---

## 2. Tech Stack

Already installed (verify in `package.json`):
- **Next.js 16** (App Router) — note: breaking changes vs prior Next versions; always read `node_modules/next/dist/docs/` first.
- **React 19** — server components by default; mark interactive shells with `"use client"`.
- **Tailwind v4** — design tokens via `@theme` block in `globals.css`.
- **GSAP** — micro-animations (tab open, cursor blink, panel resize).
- **Lenis** — optional, only inside long file previews (e.g., resume.md).

To add (only if justified):
- **shiki** (syntax highlighting at build time, zero client JS) — preferred over Prism/highlight.js.
- **cmdk** (command palette) — `Cmd+P` quick open, `Cmd+Shift+P` command palette. Light, ~6kb.
- **fuse.js** (fuzzy search for palette) — optional; cmdk has built-in matching.
- **zustand** (single store for editor state: open tabs, active tab, theme, terminal history).

Avoid:
- Monaco / CodeMirror (heavy, unnecessary — content is read-only).
- xterm.js (we are simulating, not emulating; a textarea + state machine is enough and 50x lighter).
- Any auth, DB, or server functions for v1.

---

## 3. Information Architecture

The file tree IS the IA. Treat it like a real repo.

```text
~/portfolio
├── README.md                        # landing — who I am, 3-line pitch
├── about/
│   ├── bio.md
│   ├── timeline.md                  # career timeline as commit log
│   └── photo.png                    # opens in an "image preview" tab
├── projects/
│   ├── _index.md                    # grid of all projects
│   ├── project-alpha/
│   │   ├── README.md
│   │   ├── stack.md
│   │   ├── screenshots/
│   │   │   ├── home.png
│   │   │   └── flow.png
│   │   └── live.url                 # special: clicking opens external in new tab
│   └── project-beta/
│       └── ...
├── writing/
│   ├── _index.md
│   └── posts/
│       └── on-shipping.md
├── experience/
│   ├── company-a.md
│   └── company-b.md
├── resume.pdf                       # opens as inline PDF preview tab
├── contact.md                       # contact form rendered inside a tab
└── .config/
    ├── settings.json                # theme, font, motion preferences (editable!)
    └── keybindings.json             # cheat sheet
```

Hidden easter eggs (discoverable via `ls -a` in terminal):
- `.secrets/` — silly content, leave room for one or two.
- `~/.zshrc` — fake dotfile that opens an "about my dev environment" tab.

---

## 4. UI Layout

Pixel-faithful to VS Code's default dark theme but with **one custom theme** that matches the existing brutalist direction, so it ties into the rest of this repo. Theme switcher in status bar.

```text
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  File  Edit  View  Go  Run  Terminal  Help                        │ ← titlebar (macOS traffic lights left)
├───┬──────────────────────────┬───────────────────────────────────────┤
│   │ EXPLORER                 │ README.md  ×  │ project-alpha  ×  │ + │ ← tab bar
│ A │  ▾ portfolio             ├───────────────────────────────────────┤
│ c │    ▸ about               │                                       │
│ t │    ▾ projects            │   # Hi, I'm <name>                    │
│ i │       ▸ project-alpha    │                                       │
│ v │       ▸ project-beta     │   I build ___ for ___.                │
│ i │    ▸ writing             │   ...                                 │
│ t │    ▸ experience          │                                       │
│ y │    README.md             │                                       │
│   │    resume.pdf            │                                       │
│ B │    contact.md            │                                       │
│ a │  ▸ .config               │                                       │
│ r │                          │                                       │
│   │                          ├───────────────────────────────────────┤
│   │                          │ TERMINAL  PROBLEMS  OUTPUT            │ ← panel tabs
│   │                          │ $ ls projects/                        │
│   │                          │ project-alpha  project-beta           │
│   │                          │ $ _                                   │
├───┴──────────────────────────┴───────────────────────────────────────┤
│  main ●  ⓘ 0 ⚠ 0  Ln 1, Col 1  UTF-8  LF  Markdown  hi@me.dev       │ ← status bar
└──────────────────────────────────────────────────────────────────────┘
```

### Regions
1. **Activity bar** (left, 48px) — icons: explorer, search, source-control (links to GitHub), extensions (skills), settings.
2. **Side bar** (left, resizable 200–400px) — explorer tree by default; swaps content per activity icon.
3. **Editor group** (center, flex) — tab bar + editor pane. Supports split-right.
4. **Panel** (bottom, resizable, collapsible) — terminal, problems (= fun fake lint warnings about my actual weaknesses), output (= build log replay).
5. **Status bar** (bottom, 22px) — git branch (real-time from `git rev-parse`), problems count, position, encoding, EOL, language, contact email button.
6. **Title bar** (top, 30px) — fake menus that on click open the command palette filtered.

### Responsive collapse
- ≥ 1024px: full IDE.
- 768–1023px: sidebar collapses to icons; panel toggleable.
- < 768px: tabs become a horizontal scroll; sidebar becomes a slide-over; terminal hidden behind a "⌨ shell" button.

---

## 5. Interaction Spec

### File tree
- Click folder → expand/collapse with chevron rotation.
- Click file → open in active tab group; focus the tab.
- Cmd+Click file → open in new split.
- Right-click → context menu (Open, Open to side, Reveal in terminal — runs `cd` to that path).
- Keyboard: arrow keys navigate; Enter opens; Space previews without focusing.

### Tabs
- Open many; horizontal overflow scrolls.
- Drag to reorder (use native HTML5 DnD, no library).
- Middle-click closes. Cmd+W closes active.
- Modified indicator (●) on `contact.md` while user is typing in the form.
- Pinned tabs (README.md is pinned by default).

### Terminal (the centerpiece)
Implemented as a state machine, not a real shell.

**Commands (v1):**
| Command | Behavior |
|---|---|
| `help` | List available commands with descriptions. |
| `ls [path]` | List directory contents from the virtual FS. |
| `cd <path>` | Change working directory (affects prompt + relative paths). |
| `pwd` | Print working directory. |
| `cat <file>` | Print file contents inline in terminal. |
| `open <file>` | Open file as editor tab. |
| `code <file>` | Alias for `open`. |
| `clear` | Clear terminal scrollback. |
| `whoami` | One-line bio. |
| `contact` | Open `contact.md` tab and focus name field. |
| `theme [name]` | Switch theme (`dark`, `light`, `brutalist`); no arg lists themes. |
| `history` | Show command history. |
| `echo <text>` | Echo. |
| `date` | Print current date in ISO. |
| `tree [path]` | ASCII tree of a folder. |
| `grep <pattern> <path>` | Naive substring search across markdown files. |
| `sudo *` | Cheeky "permission denied" reply. |
| `rm -rf /` | Pre-canned safe joke output. |

**Behavior:**
- Up/Down arrows cycle history (persisted to localStorage).
- Tab key autocompletes paths and command names.
- Ctrl+C cancels current input (clears the line, prints `^C`).
- Ctrl+L clears (same as `clear`).
- Prompt: `user@portfolio:<cwd>$ `. Colorized.
- Unknown command → `zsh: command not found: <x>` with a "Did you mean …?" suggestion using Levenshtein distance against known commands.

**Out of scope for v1:** pipes, redirects, env vars, multi-line input.

### Command palette
- `Cmd+P` (or `Ctrl+P`): fuzzy open file by name.
- `Cmd+Shift+P`: command palette — every terminal command + UI actions (Toggle Terminal, Split Editor, Change Theme, Go to Project Alpha, etc.).
- Recent files surfaced first.

### Status bar interactions
- Click git branch → opens GitHub profile in new tab.
- Click email → copies email to clipboard with toast.
- Click language indicator → switches preview language for the current file (cosmetic).

---

## 6. Data Model

All content lives as typed TypeScript objects under `src/data/` so there's no runtime fetch. The virtual filesystem is **derived from this data**, not the other way around — never let path strings drift from source.

```ts
// src/data/fs.ts
export type FsNode =
  | { kind: 'dir'; name: string; children: FsNode[] }
  | {
      kind: 'file';
      name: string;
      // What kind of view the editor should render
      view: 'markdown' | 'image' | 'pdf' | 'json' | 'url' | 'form';
      // Source content (markdown string, image path, etc.)
      source: string;
      // Optional metadata used by tabs / status bar
      language?: string;
      pinned?: boolean;
    };

export const FS: FsNode = { /* the tree above, fully populated */ };
```

Helpers:
- `resolvePath(cwd, input): FsNode | null` — handles `..`, `~`, absolute, relative.
- `readDir(node): FsNode[]`
- `searchFs(query, root): FsNode[]` — for palette + `grep`.

State (zustand store):
```ts
type EditorState = {
  cwd: string;
  openTabs: { path: string; dirty: boolean }[];
  activeTab: string | null;
  splits: ('left' | 'right')[];
  terminalOpen: boolean;
  terminalHistory: TerminalLine[];
  commandHistory: string[];
  theme: 'dark' | 'light' | 'brutalist';
  sidebarWidth: number;
  panelHeight: number;
};
```

Persistence: `theme`, `commandHistory`, `sidebarWidth`, `panelHeight` → localStorage. Open tabs → **not** persisted (always boot to README pinned).

---

## 7. File / Component Layout

Follows the existing repo's feature-folder convention (`src/components/sections`, `src/components/ui`, etc.).

```text
src/
├── app/
│   ├── layout.tsx                  # html shell, font, theme cookie read
│   ├── page.tsx                    # mounts <IdePortfolio />
│   └── globals.css                 # theme tokens (3 themes), monospace font, scrollbars
├── components/
│   ├── ide/
│   │   ├── IdePortfolio.tsx        # top-level layout; orchestrates store
│   │   ├── TitleBar.tsx
│   │   ├── ActivityBar.tsx
│   │   ├── SideBar.tsx             # routes to Explorer / Search / Settings panels
│   │   ├── Explorer.tsx            # tree, keyboard nav, context menu
│   │   ├── TabBar.tsx              # drag, close, overflow
│   │   ├── EditorGroup.tsx         # renders the active tab's view
│   │   ├── Panel.tsx               # bottom panel container (tabs: terminal/problems/output)
│   │   ├── StatusBar.tsx
│   │   └── views/
│   │       ├── MarkdownView.tsx    # shiki-rendered MD
│   │       ├── ImageView.tsx
│   │       ├── PdfView.tsx
│   │       ├── JsonView.tsx        # interactive: collapsible nodes
│   │       ├── UrlView.tsx         # iframe-or-redirect with safety prompt
│   │       └── FormView.tsx        # contact form
│   ├── terminal/
│   │   ├── Terminal.tsx            # input + scrollback rendering
│   │   ├── prompt.ts               # renders the PS1
│   │   ├── parser.ts               # tokenize input
│   │   ├── commands/
│   │   │   ├── ls.ts
│   │   │   ├── cd.ts
│   │   │   ├── cat.ts
│   │   │   ├── open.ts
│   │   │   ├── help.ts
│   │   │   ├── theme.ts
│   │   │   └── ...                 # one file per command
│   │   └── completer.ts            # Tab completion
│   └── palette/
│       └── CommandPalette.tsx
├── data/
│   ├── fs.ts                       # virtual filesystem tree (source of truth)
│   ├── projects.ts                 # already exists — wire into fs.ts
│   ├── experience.ts
│   ├── profile.ts
│   ├── skills.ts
│   └── testimonials.ts
├── hooks/
│   ├── useEditorStore.ts           # zustand
│   ├── useHotkeys.ts               # Cmd+P, Cmd+Shift+P, Cmd+W, Cmd+B, Ctrl+`
│   ├── useResizable.ts             # split/panel resize
│   └── useReducedMotion.ts
├── lib/
│   ├── fs/
│   │   ├── resolve.ts
│   │   ├── search.ts
│   │   └── tree.ts                 # ASCII tree renderer
│   ├── markdown.ts                 # shiki + remark setup, build-time render
│   └── fuzzy.ts                    # ranking for palette
└── styles/
    ├── tokens.css
    └── themes.css                  # dark / light / brutalist variables
```

---

## 8. Theming

Three themes, each a complete VS Code-style palette. Tokens defined in `themes.css` and consumed everywhere via CSS variables — no hex literals in components.

```css
[data-theme='dark'] {
  --bg-editor: #1e1e1e;
  --bg-sidebar: #252526;
  --bg-statusbar: #007acc;
  --fg-default: #d4d4d4;
  --fg-muted: #858585;
  --accent: #569cd6;
  --border: #3c3c3c;
  /* ...syntax tokens... */
}

[data-theme='light'] { /* VS Code Light+ */ }

[data-theme='brutalist'] {
  /* Carries over the existing brutalist direction from this repo:
     stark black-on-white, heavy borders, no shadows, one acidic accent. */
  --bg-editor: #f4f4f0;
  --bg-sidebar: #ffffff;
  --bg-statusbar: #000000;
  --fg-default: #0a0a0a;
  --accent: #c8ff00;
  --border: #000000;
}
```

Theme is persisted to localStorage and to a `theme` cookie so SSR doesn't flash.

---

## 9. Accessibility

This concept skews developer-aesthetic, but a portfolio that's inaccessible loses real opportunities. Non-negotiable:

- All actions reachable via keyboard. Tab order is sensible: titlebar → activity bar → sidebar → tabs → editor → panel → statusbar.
- File tree implements ARIA `tree`/`treeitem` with `aria-expanded` and `aria-level`.
- Tabs implement ARIA `tablist`/`tab`/`tabpanel`.
- Terminal: `role="log"` with `aria-live="polite"` for output; input is a labeled `<input>`. Don't use `aria-live="assertive"`.
- Provide a `?simple=1` query parameter that renders a plain semantic version (header → main → sections) for screen-reader-only or no-JS visitors. Link to it in the footer of `README.md`.
- Respect `prefers-reduced-motion`: kill cursor blink, tab open animation, terminal type-out effect.
- Color contrast: every theme must pass WCAG AA for body text (4.5:1) and UI components (3:1). Verify with axe in CI.
- Focus rings visible on all themes, including brutalist (use `outline: 2px solid var(--accent); outline-offset: 2px`).

---

## 10. Performance Budget

Targets (mid-tier mobile, 4G):
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1
- JS gzipped < 150kb initial route
- CSS gzipped < 30kb

Tactics:
- All markdown is rendered at **build time** with shiki → ship HTML strings, not a markdown runtime.
- Terminal and palette are **dynamic imports**, gated on first interaction (`useEffect` + interaction listener, or `next/dynamic` with `ssr: false` triggered on hover/focus).
- Code-split per view type: `JsonView`, `PdfView` lazy-loaded only when a file of that type is opened.
- No web fonts on initial paint — system monospace stack (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`). Optional: load JetBrains Mono later with `font-display: swap`, single weight (400) only.
- Images: explicit width/height, AVIF with WebP fallback via `next/image`. Project screenshots lazy.
- No GSAP on the critical path — animations are CSS transitions for tab/panel; GSAP only loaded if the user opens a project with motion content.

---

## 11. Easter Eggs

A few, restrained. They reward exploration without becoming the point.

- `sudo hire-me` → opens contact.md and pre-fills a fun subject line.
- `vim` → modal popup: "Quit with `:q`. (Yes, really.)" with a working `:q` handler that closes it.
- `:wq` in the editor area triggers a "saved" toast even though nothing is saved.
- Konami code → swaps the activity bar icons for cat emojis for 10s.
- `git blame` on any file → returns the same author + "you should be working" timestamp.

Keep to ≤ 5. The line between charming and corny is thin.

---

## 12. Build Phases

Each phase ends with a deployable site. Don't merge a phase that breaks the previous one.

### Phase 0 — Foundations (½ day)
- Define tokens, three themes, monospace stack, base resets in `globals.css`.
- Wire zustand store + theme persistence cookie.
- Scaffold the empty IDE layout shell (titlebar, activity bar, sidebar, editor, panel, statusbar) with no interactivity.
- Acceptance: site renders the chrome, theme switch works, looks like an IDE.

### Phase 1 — Static content via the file tree (1 day)
- Build `data/fs.ts` populated from existing `projects.ts`, `experience.ts`, etc.
- Implement `Explorer` with expand/collapse + click-to-open.
- Implement `TabBar` + `EditorGroup` with `MarkdownView` only.
- Markdown rendering via shiki at build time.
- Acceptance: visitor can click through every file and read its content. Pure mouse navigation works.

### Phase 2 — Terminal (1 day)
- Build the terminal state machine: parser, prompt, scrollback.
- Implement `ls`, `cd`, `pwd`, `cat`, `open`, `clear`, `help`, `whoami`, `echo`, `date`, `history`.
- Tab completion + arrow-key history.
- Persist command history to localStorage.
- Acceptance: every nav action achievable via mouse is also achievable via terminal.

### Phase 3 — Command palette + hotkeys (½ day)
- `Cmd+P` fuzzy file open.
- `Cmd+Shift+P` command palette (mirrors every terminal command).
- `Cmd+W`, `Cmd+B`, `Ctrl+\``, `Cmd+\\` (split).
- Acceptance: keyboard-only user can use everything.

### Phase 4 — Extended views (1 day)
- `ImageView` for screenshots.
- `PdfView` (iframe-based, lazy).
- `JsonView` for `.config/settings.json` — interactive nested toggling.
- `FormView` for `contact.md` — wired to Formspree or `mailto:` for v1.
- `UrlView` for `*.url` (project live links) with a safety prompt.
- Acceptance: every file type from the tree renders something useful.

### Phase 5 — Polish (1 day)
- Drag-and-drop tab reordering.
- Resizable sidebar + panel (persisted).
- Split editor (open to side).
- Status bar interactivity (git branch links, copy email).
- Animations (tab open, cursor blink) with reduced-motion respect.
- Easter eggs.
- Acceptance: nothing feels stubbed.

### Phase 6 — Responsive + a11y pass (½ day)
- Mobile layout: collapsed sidebar, hidden panel, swipe tabs.
- Implement `?simple=1` plain-semantic fallback.
- Run axe; fix all violations.
- Test with VoiceOver and keyboard-only.
- Acceptance: passes axe + manual SR test.

### Phase 7 — Performance + SEO (½ day)
- Verify Lighthouse targets.
- Add `<meta>` tags, OpenGraph image, `sitemap.xml`, `robots.txt`.
- Pre-render every file route under `/p/<path>` for direct linking + SEO (each opens the IDE with that tab focused).
- Acceptance: shareable URLs work, Lighthouse green.

---

## 13. Routing & Shareable URLs

The IDE is a single page, but **every file is linkable**.

- `/` → IDE with `README.md` open.
- `/p/projects/project-alpha` → IDE with that file as the active tab. Server reads the path param, mounts the IDE with that tab already in the open-tabs list and focused.
- `/simple` → plain semantic fallback (every section as `<section>`, no IDE chrome).

Use Next.js dynamic route `app/p/[...path]/page.tsx` that resolves the path against `FS` at request time. If unknown, 404 inside the IDE chrome (render a fake "File not found" tab that's still real content with links back).

---

## 14. Risk Log & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Concept reads as gimmick to non-technical viewers | High | Pinned README.md opens by default with a 3-line plain-English pitch; `?simple=1` fallback linked from footer. |
| Mobile experience feels cramped | High | Dedicated mobile layout (Phase 6) — drop IDE metaphor, keep file-tree-driven navigation. |
| Terminal becomes a tarpit of "implement bash" tickets | Medium | Hard freeze the v1 command list. New commands only behind a written use case. |
| Heavy JS shipped for "novelty" features | Medium | Performance budget enforced via Lighthouse CI; dynamic imports for terminal/palette/views. |
| Accessibility falls behind aesthetic | Medium | A11y is Phase 6, not "later"; CI runs axe. |
| Markdown rendering at runtime balloons bundle | Low | Shiki at build time only. No client-side MD parser. |
| Easter eggs distract reviewers | Low | Hard cap at five; none on the default landing path. |

---

## 15. Definition of Done

- [ ] All file-tree paths reachable via mouse, keyboard, terminal, and direct URL.
- [ ] Three themes, persisted, no FOUC.
- [ ] Lighthouse: Perf ≥ 95, A11y = 100, Best Practices ≥ 95, SEO = 100 on `/`.
- [ ] axe-core: zero violations on every view.
- [ ] Works with JS disabled at `/simple`.
- [ ] Tested on Chrome, Firefox, Safari (desktop) + iOS Safari + Android Chrome.
- [ ] No console errors. No layout shift > 0.1.
- [ ] README explains the concept in 30 seconds for someone who lands on `/simple`.

---

## 16. Open Questions

Things to decide before Phase 1 ships.

1. **Real shell feel vs guided exploration?** Should `help` auto-run on first visit? Or is a single-line hint above the prompt (`type 'help' to begin`) enough?
2. **Project content depth.** Are project pages long-form case studies (markdown) or short stack-and-links cards? Affects writing workload, not architecture.
3. **Contact form backend.** Formspree (free tier, 50/mo), Resend + a tiny Next route, or `mailto:` for v1? Recommend Formspree for v1.
4. **Analytics.** Plausible (privacy-friendly, single script) or none for v1? Recommend Plausible if a custom domain is in scope.
5. **Custom theme as default, or VS Code dark as default?** VS Code dark for instant recognition; brutalist theme as the "personality" option.


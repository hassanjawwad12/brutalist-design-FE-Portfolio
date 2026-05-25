# hassan@portfolio

A portfolio site where the UI **is** a working VS Code / shell. Visitors land inside an editor, browse the file tree, type real shell-style commands, and projects open as tabs.

Everything that would normally live on a portfolio page — bio, projects, experience, resume, contact — is a file in the virtual filesystem. There are three ways to reach any piece of content: click it in the explorer, run a command in the terminal, or open the command palette.

- **Theme:** hacker terminal (phosphor green on black, CRT scanlines).
- **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind v4.
- **No backend.** Everything is statically prerendered.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The IDE boots with `README.md` pinned as the first tab.

To produce a production build:

```bash
npm run build
npm run start
```

---

## The IDE

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ☐  hassan@portfolio    File Edit View Go Run Terminal Help    — role —  │  titlebar
├────┬─────────────────────┬────────────────────────────────────────────────┤
│ A  │  EXPLORER           │  README.md  ×  resume.pdf  ×  contact.md  ×   │  tabs
│ c  │  ▾ portfolio        ├────────────────────────────────────────────────┤
│ t  │    ▸ about          │                                                │
│ i  │    ▾ projects       │   # Hi, I'm Muhammad Hassan Jawwad             │
│ v  │       ▸ task-rise   │   …                                            │
│ i  │       ▸ sudha       │                                                │
│ t  │       ▸ kassoma     │                                                │
│ y  │       ▸ event-mgmt  │                                                │
│    │    ▸ writing        ├────────────────────────────────────────────────┤
│ B  │    README.md ◉      │  TERMINAL  PROBLEMS(3)  OUTPUT                 │
│ a  │    resume.pdf       │  hassan@portfolio:~$ ls projects/              │
│ r  │    photo.png        │  task-rise/  sudha/  kassoma/  event-mgmt/     │
│    │    contact.md       │  hassan@portfolio:~$ _                         │
├────┴─────────────────────┴────────────────────────────────────────────────┤
│  ⎇ main  ● 0 ⚠ 0  ◫ sidebar  ▼ terminal       cwd ~ · README.md · …      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Regions

| Region | Purpose |
|---|---|
| **Title bar** | Macro identity, fake menus that open the command palette, link to `/simple`. Hamburger on mobile. |
| **Activity bar** | Switch between Explorer, Search, GitHub (external), Settings (`.config/settings.json`). |
| **Side bar** | Explorer tree or live grep search. Resizable (drag the right edge), collapsible. |
| **Tab bar** | Open files. Drag to reorder, middle-click or `×` to close, `◧` to split. Pinned tabs (`◉`) are not closeable. |
| **Editor** | Renders the active file with a view appropriate to its type (markdown / json / image / pdf / url / form). |
| **Panel (bottom)** | Terminal · Problems (cheeky fake lints) · Output (fake build log). Resizable, collapsible. |
| **Status bar** | Git branch (→ GitHub profile), problem counts, cwd, active file, encoding, language, copy-email button. |

---

## File tree (what every file means)

```
~/portfolio
├── README.md            # what you're reading
├── about/
│   ├── bio.md           # narrative
│   ├── timeline.md      # career as commit log
│   ├── skills.md        # skill matrix
│   └── testimonials.md  # quotes from past collaborators
├── projects/
│   ├── _index.md
│   └── <id>/
│       ├── README.md
│       ├── stack.md
│       ├── screenshots/
│       │   ├── home.png  (or .svg fallback)
│       │   └── flow.svg
│       └── live.url      # opens external in a new tab w/ confirm
├── writing/
│   ├── _index.md
│   └── posts/on-shipping.md
├── resume.pdf           # real PDF — embedded iframe, print or download
├── photo.png            # avatar (SVG-as-image)
├── contact.md           # form view, mails to me on submit
├── .config/             # (hidden) editable JSON: settings, keybindings
├── .secrets/            # (hidden) easter eggs
└── .zshrc               # (hidden) my actual shell rc, decoratively
```

Hidden files (anything starting with `.`) only show up via `ls -a` in the terminal — same as a real shell. Each file also has a real URL: `/p/projects/task-rise/README.md`, etc.

---

## Terminal — all commands

The terminal is a state machine, not a real shell. It's persistent across page interactions, command history is saved to `localStorage`, and `Tab` autocompletes both commands and paths.

| Command | Description | Example |
|---|---|---|
| `help` | List every command with one-line descriptions. | `help` |
| `ls [path]` | List directory contents. `-a` includes hidden, `-l` long format. | `ls -la projects/` |
| `cd <path>` | Change working directory (`..`, `~`, absolute, relative). | `cd projects/task-rise` |
| `pwd` | Print working directory. | `pwd` |
| `cat <file>` | Print file contents inline. | `cat about/bio.md` |
| `open <file>` | Open file as an editor tab. | `open resume.pdf` |
| `code <file>` | Alias for `open`. | `code contact.md` |
| `tree [path]` | ASCII tree of a directory. `-a` includes hidden. | `tree -a` |
| `grep <pattern> [path]` | Substring search across markdown files. | `grep "golang" /` |
| `whoami` | One-line bio. | `whoami` |
| `contact` | Open the contact form tab. | `contact` |
| `echo <text>` | Echo arguments. | `echo "hello"` |
| `date` | Print current date (ISO). | `date` |
| `history` | Show the last 50 commands. | `history` |
| `clear` | Clear the terminal scrollback (same as `Ctrl+L`). | `clear` |
| `theme` | Reports the (single) hacker-green theme. | `theme` |
| `git <status\|log\|blame>` | Fake git for vibes. | `git log` |
| `vim` | Launches a modal vim. `:q` to quit. (Yes, really.) | `vim` |
| `sudo <anything>` | Permission denied — except for `sudo hire-me`. | `sudo hire-me` |
| `rm -rf /` | Returns a safe joke output. | (don't.) |

### Terminal keys

| Key | Effect |
|---|---|
| `↑` / `↓` | Cycle command history. |
| `Tab` | Autocomplete command name or path. |
| `Enter` | Run. |
| `Ctrl+C` | Cancel current line. |
| `Ctrl+L` | Clear scrollback. |

Unknown commands return `zsh: command not found: <x>` with a `did you mean…?` suggestion based on Levenshtein distance.

---

## Global hotkeys

| Hotkey | What it does |
|---|---|
| `Cmd+P` / `Ctrl+P` | Quick-open file (fuzzy filter every file in the tree). |
| `Cmd+Shift+P` | Command palette (all UI actions + every terminal command). |
| `Cmd+B` / `Ctrl+B` | Toggle the sidebar. |
| `Cmd+J` / `Ctrl+\`` | Toggle the bottom panel (terminal). |
| `Cmd+\\` | Split editor — opens the active tab in a right pane. |
| `Cmd+W` | Close the focused tab / split (skipped when typing). |
| `Esc` | Close the palette / vim modal / mobile drawer. |
| `↑↑↓↓←→←→BA` | (try it) |

---

## File views

Each file kind renders in a dedicated view; opening it from any path (click, terminal `open`, `Cmd+P`, or direct URL) lands you in the right one.

- **markdown** — phosphor-styled prose with custom syntax-highlighted code blocks. Internal links open as tabs.
- **json** — interactive collapsible tree (`.config/settings.json`, `.config/keybindings.json`).
- **image** — chrome with filename, dimensions, fit/1:1 zoom, download. Used for project screenshots and `photo.png`.
- **pdf** — for real PDFs (resume): embedded iframe with zoom 50–200%, print, download, open-in-new-tab. For markdown-as-pdf entries it falls back to a page-styled view with a print-to-PDF button.
- **url** — `.url` files (like `projects/<id>/live.url`) show an "external link" page with an HTTPS pill, domain badge, and **two-step confirm** before opening — no auto-redirect.
- **form** — `contact.md` renders an inline form that opens the user's mail client pre-filled to my address.

---

## Sharing & SEO

Every file in the tree is also a real, statically prerendered URL under `/p/`. Examples:

- `/p/README.md`
- `/p/projects/task-rise/README.md`
- `/p/resume.pdf`
- `/p/about/timeline.md`

Each URL gets its own `<title>` and OpenGraph meta tags pulled from the file's first heading and paragraph, so link previews on Twitter / LinkedIn / Slack show the actual file content. The root has a generated 1200×630 OG image (`/opengraph-image`) in the terminal aesthetic.

`sitemap.xml`, `robots.txt` are generated at build time. The plain semantic version of the portfolio lives at `/simple` (no JS required) and is linked from the title bar.

---

## Accessibility

- Full keyboard navigation. Tab order: titlebar → activity bar → sidebar → tabs → editor → panel → statusbar.
- File tree exposes ARIA `tree` / `treeitem` with `aria-level` and `aria-expanded`.
- Tabs use ARIA `tablist` / `tab` / `tabpanel`.
- Terminal is `role="log"` with `aria-live="polite"`. Input is labeled.
- Modal palette and vim use `role="dialog"` + `aria-modal`.
- `/simple` route renders all content as plain `<section>` / `<article>` / `<h1-3>` semantics — works with JS disabled.
- Respects `prefers-reduced-motion` (kills the cursor blink, status-bar pulse, drawer transitions).

---

## Responsive behaviour

| Width | Layout |
|---|---|
| ≥ 1024px | Full IDE. |
| 769–1023px | Same layout, tighter paddings. |
| ≤ 768px | Activity bar hides, sidebar becomes a slide-over drawer (`☰` in the title bar), tab paddings tighten, panel shrinks. |
| ≤ 480px | Further heading/panel shrinkage. |

The mobile drawer auto-closes when a file is opened and on `Esc`.

---

## Project layout

```
src/
├── app/
│   ├── layout.tsx              # root, metadata, font, metadataBase
│   ├── page.tsx                # mounts IdePortfolio
│   ├── simple/page.tsx         # plain semantic fallback
│   ├── p/[...path]/page.tsx    # one prerendered URL per file
│   ├── opengraph-image.tsx     # generated OG (1200×630)
│   ├── sitemap.ts              # full sitemap
│   ├── robots.ts               # robots.txt
│   └── globals.css             # tokens + responsive CSS
├── components/
│   ├── ide/                    # TitleBar, ActivityBar, SideBar, Explorer, TabBar,
│   │                           # EditorGroup, Panel, StatusBar, CommandPalette,
│   │                           # VimModal, IdePortfolio, store.tsx, views/*
│   └── terminal/               # Terminal, parser, commands
├── data/
│   ├── profile.ts              # who I am
│   ├── projects.ts             # projects metadata
│   ├── experience.ts           # work history
│   ├── skills.ts               # skill weights
│   ├── testimonials.ts
│   └── fs.ts                   # virtual filesystem (source of truth for the IDE)
├── hooks/useHotkeys.ts         # global keybindings
├── lib/
│   ├── fs.ts                   # path resolution, listDir, walkFiles, grep, completions
│   ├── fuzzy.ts                # fuzzy ranking + Levenshtein suggestions
│   ├── markdown.tsx            # tiny inline markdown renderer (no runtime parser)
│   └── site.ts                 # SITE_URL from env, Vercel-aware
└── styles/tokens.css           # phosphor palette + sizing tokens
```

---

## Deployment

Designed for any host that runs Next.js (Vercel, Netlify, Cloudflare Pages, Render, self-hosted). Everything is statically prerenderable.

### On Vercel (recommended)

1. Push the repo to GitHub.
2. Import into Vercel — no config needed.
3. Vercel automatically populates `VERCEL_URL`, which the metadata picks up.
4. (Optional but recommended) set `NEXT_PUBLIC_SITE_URL` in the project's environment variables to your real domain (e.g. `https://hassan.dev`) so OpenGraph URLs, sitemap, and canonical links use the canonical host rather than the auto-generated preview URL.

### Anywhere else

```bash
npm install
NEXT_PUBLIC_SITE_URL=https://yourdomain.com npm run build
npm run start
```

Or static-export friendly — every route is prerendered, so platforms like Cloudflare Pages or static buckets work too.

See `.env.example` for the full set of env vars.

### Files to update before deploying

| File | What to change |
|---|---|
| `src/data/profile.ts` | name, role, location, email, socials |
| `src/data/projects.ts` | your actual projects |
| `src/data/experience.ts` | your work history |
| `src/data/skills.ts` | your skill weights |
| `src/data/testimonials.ts` | (optional) testimonials |
| `public/resume/Muhammad-Hassan-Jawwad.pdf` | your real PDF |
| `public/project-pics/*.png` | your project screenshots |

The virtual filesystem (`src/data/fs.ts`) is derived from these, so adding a project to `projects.ts` automatically gets it a directory in the IDE and a set of static URLs under `/p/projects/<id>/…`.

---

## What's intentionally out of scope

- Real code execution / WebContainers / a Monaco editor.
- Live editing of files in the browser.
- Authentication, user accounts, comments.
- Multi-language i18n.
- A blog CMS — markdown lives in `src/data/fs.ts` (committed to git, which is the CMS).

---

## Credits

- Concept: a faithful VS Code clone that renders portfolio data, scoped to a single page.
- Aesthetic: hacker terminal — black background, phosphor green, amber accents, CRT scanlines.
- Built with: Next.js 16, React 19, TypeScript 5, Tailwind v4. No runtime markdown parser, no Monaco, no xterm.

Contact: `hassanjawwad12@gmail.com` (or just run `contact` in the terminal).

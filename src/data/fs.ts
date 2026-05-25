import { profile } from "./profile";
import { projects } from "./projects";
import { experience } from "./experience";
import { skills } from "./skills";
import { testimonials } from "./testimonials";

export type FsFileView =
  | "markdown"
  | "image"
  | "json"
  | "url"
  | "form"
  | "pdf"
  | "ascii";

export interface FsFile {
  kind: "file";
  name: string;
  view: FsFileView;
  source: string;
  language?: string;
  pinned?: boolean;
  hidden?: boolean;
}

export interface FsDir {
  kind: "dir";
  name: string;
  children: FsNode[];
  hidden?: boolean;
}

export type FsNode = FsFile | FsDir;

const readmeContent = `# Hi, I'm ${profile.name}

> ${profile.tagline}

I'm a **${profile.role}** based in ${profile.location} — currently *${
  profile.availability === "available"
    ? "available for work"
    : profile.availability === "selective"
      ? "taking on selective work"
      : "not taking new work"
}*.

${profile.bio}

---

## Quick start

This portfolio is a fake IDE. Everything you'd find in a CV is a file in the explorer on the left.

- Click any file in the explorer to open it as a tab.
- Open the terminal at the bottom and type \`help\` to see all commands.
- Press \`Cmd+P\` (or \`Ctrl+P\`) to fuzzy-open any file.
- Press \`Cmd+Shift+P\` for the command palette.

## Find me

${profile.socials.map((s) => `- **${s.label}** → [${s.handle}](${s.href})`).join("\n")}
- **Email** → [${profile.email}](mailto:${profile.email})

Or just run \`contact\` in the terminal.
`;

const bioContent = `# About

${profile.bio}

## What I care about

- **Typography** — text is the interface most days.
- **Latency budgets** — under 200ms or it doesn't ship.
- **Small details** — the things you only notice when they're missing.

## What I'm doing right now

- Shipping AI-powered litigation tooling to real legal customers.
- Building this portfolio as a working IDE-in-the-browser.
- Reading too much about compilers and not enough about anything else.

## Where I am

Based in ${profile.location}. Comfortable with deep-async remote work across timezones.
`;

const timelineContent = `# Timeline

A career as a commit log.

${experience
  .map(
    (e) => `## ${e.title}${e.org ? ` — ${e.orgHref ? `[${e.org}](${e.orgHref})` : e.org}` : ""}
\`${e.period}\`

${e.summary}

${e.highlights.map((h) => `- ${h}`).join("\n")}
`,
  )
  .join("\n---\n\n")}
`;

const skillsContent = `# Skills

A rough weighting of what I reach for.

${(["frontend", "backend", "data", "tooling"] as const)
  .map((group) => {
    const items = skills.filter((s) => s.group === group);
    if (items.length === 0) return "";
    const label = group.charAt(0).toUpperCase() + group.slice(1);
    return `## ${label}

${items
  .sort((a, b) => b.weight - a.weight)
  .map((s) => `- \`${s.label}\` ${"▮".repeat(s.weight)}${"▯".repeat(5 - s.weight)}`)
  .join("\n")}
`;
  })
  .join("\n")}
`;

const testimonialsContent = `# Testimonials

What people have said. Names attached.

${testimonials
  .map(
    (t) => `> ${t.quote}
>
> — **${t.author}**, *${t.role}*
`,
  )
  .join("\n")}
`;

const projectsIndexContent = `# Projects

A grid of work I've shipped. Open any \`README.md\` for details.

${projects
  .map(
    (p) => `## ${p.index} — ${p.title}
\`${p.year}\` · \`${p.role}\` · \`${p.status}\`

${p.description}

**Stack:** ${p.stack.map((s) => `\`${s}\``).join(" ")}

→ [Open project](${p.href})${p.repo ? ` · [Repo](${p.repo})` : ""}
`,
  )
  .join("\n---\n\n")}
`;

const projectReadme = (p: (typeof projects)[number]): string => {
  const img = PROJECT_IMAGES[p.id];
  return `# ${p.title}

\`${p.year}\` · \`${p.role}\` · \`${p.status}\`
${img ? `\n![${p.title} screenshot](${img})\n` : ""}
${p.description}

## Stack

${p.stack.map((s) => `- ${s}`).join("\n")}

## Links

- **Live** → [${p.href}](${p.href})
${p.repo ? `- **Repo** → [${p.repo}](${p.repo})` : ""}
`;
};

const projectStack = (p: (typeof projects)[number]): string => `# Stack — ${p.title}

${p.stack.map((s) => `- ${s}`).join("\n")}
`;

const onShippingPost = `# On shipping

The only metric that survives is whether the thing went out the door.

You can have the cleanest architecture in the world, but if it lives on a branch nobody else opens, it's worth nothing. Shipping is not the last step. It's the *only* step the world sees.

## What shipping actually requires

- A user-facing surface that does *one* thing, well.
- A path to roll back when it breaks.
- Someone who cares if it breaks at 3am.

That last one is the rare one.

## What I've stopped doing

- Building abstractions I think I'll need.
- Designing in isolation from the data the design has to hold.
- Calling a feature done before someone outside the team has touched it.

## What I've started doing

- Writing the email I'd send to the customer *before* I write the code.
- Treating dashboards as a feature, not a chore.
- Saying no to anything that can't be measured.

Shipping is a muscle. Use it.
`;

const writingIndexContent = `# Writing

Notes I keep returning to. Open one to read it.

- [\`on-shipping.md\`](/writing/posts/on-shipping.md) — what shipping actually costs.

More posts go here when they earn their keep.
`;

const contactContent = `# Contact

The fastest way to reach me:

**Email** → [${profile.email}](mailto:${profile.email})

Or fill the form below — it sends straight to the same inbox.

Connect:

${profile.socials.map((s) => `- **${s.label}** → [${s.handle}](${s.href})`).join("\n")}
`;

const settingsJson = JSON.stringify(
  {
    "editor.fontFamily": "Geist Mono, ui-monospace, monospace",
    "editor.fontSize": 13,
    "editor.lineHeight": 1.55,
    "editor.cursorBlinking": "smooth",
    "editor.minimap.enabled": false,
    "workbench.colorTheme": "Cyberpunk Neon",
    "workbench.activityBar.visible": true,
    "workbench.sideBar.location": "left",
    "terminal.integrated.fontFamily": "inherit",
    "terminal.integrated.cursorStyle": "block",
    "files.exclude": {
      ".secrets/": false,
      "**/.DS_Store": true,
    },
    "explorer.confirmDelete": false,
    "telemetry.enabled": false,
  },
  null,
  2,
);

const keybindings = JSON.stringify(
  [
    { key: "cmd+p", command: "workbench.action.quickOpen" },
    { key: "cmd+shift+p", command: "workbench.action.showCommands" },
    { key: "cmd+b", command: "workbench.action.toggleSidebarVisibility" },
    { key: "ctrl+`", command: "workbench.action.terminal.toggleTerminal" },
    { key: "cmd+w", command: "workbench.action.closeActiveEditor" },
    { key: "cmd+\\", command: "workbench.action.splitEditor" },
    { key: "esc", command: "workbench.action.closePalette" },
  ],
  null,
  2,
);

const zshrcContent = `# ~/.zshrc — minimal but mine

# prompt
export PS1="%n@portfolio:%~$ "

# editor
export EDITOR="code"
export VISUAL="$EDITOR"

# aliases
alias ll="ls -lah"
alias gs="git status -sb"
alias gd="git diff"
alias gco="git checkout"
alias k="kubectl"
alias src="cd ~/src"

# pnpm > everything else
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# 1Password CLI
eval "$(op completion zsh)"

# fzf
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh

# the one thing that matters
function ship() {
  git push origin HEAD && echo "→ shipped."
}
`;

const secretsReadme = `# .secrets/

Nothing actually secret. Move along.

But — if you found this with \`ls -a\`, you're the kind of person I'd want to work with. Shoot me a note: \`contact\`.
`;

const fortuneContent = `# fortune

> The best code is no code at all.

> Premature optimization is the root of all evil — and most of the *fun* in software.

> Two hard problems: cache invalidation, naming things, off-by-one errors.

> The only thing more dangerous than a hammer is a junior engineer with a refactor.
`;

const PROJECT_IMAGES: Record<string, string> = {
  "task-rise": "/project-pics/taskrise.png",
  sudha: "/project-pics/sudha.png",
  kassoma: "/project-pics/kasoma.png",
  "event-mgmt": "/project-pics/eventManagement.png",
};

const screenshotSvg = (
  title: string,
  subtitle: string,
  hue: "acid" | "amber" = "acid",
): string => {
  const accent = hue === "acid" ? "#33ff33" : "#ffb000";
  const dim = hue === "acid" ? "#0e8a0e" : "#c78800";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500' width='800' height='500'>
  <defs>
    <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
      <path d='M40 0H0V40' fill='none' stroke='${accent}' stroke-opacity='0.08'/>
    </pattern>
  </defs>
  <rect width='800' height='500' fill='#030503'/>
  <rect width='800' height='500' fill='url(#grid)'/>
  <rect x='0' y='0' width='800' height='40' fill='#000'/>
  <circle cx='20' cy='20' r='5' fill='${accent}' opacity='0.8'/>
  <circle cx='38' cy='20' r='5' fill='${accent}' opacity='0.4'/>
  <circle cx='56' cy='20' r='5' fill='${accent}' opacity='0.2'/>
  <text x='80' y='25' font-family='monospace' font-size='11' fill='${dim}' letter-spacing='2'>${title.toUpperCase()}</text>
  <text x='40' y='140' font-family='monospace' font-size='38' font-weight='bold' fill='${accent}' filter='url(#glow)'>${title}</text>
  <text x='40' y='180' font-family='monospace' font-size='13' fill='${dim}'>// ${subtitle}</text>
  <rect x='40' y='220' width='720' height='1' fill='${accent}' opacity='0.3'/>
  <rect x='40' y='240' width='160' height='90' fill='none' stroke='${accent}' stroke-opacity='0.4'/>
  <rect x='220' y='240' width='160' height='90' fill='none' stroke='${accent}' stroke-opacity='0.4'/>
  <rect x='400' y='240' width='160' height='90' fill='none' stroke='${accent}' stroke-opacity='0.4'/>
  <rect x='580' y='240' width='180' height='90' fill='${accent}' fill-opacity='0.06' stroke='${accent}' stroke-opacity='0.7'/>
  <text x='590' y='268' font-family='monospace' font-size='10' fill='${accent}'>ACTIVE</text>
  <text x='590' y='292' font-family='monospace' font-size='9' fill='${dim}'>load: 0.42ms</text>
  <text x='590' y='308' font-family='monospace' font-size='9' fill='${dim}'>lcp: 1.1s</text>
  <text x='40' y='380' font-family='monospace' font-size='11' fill='${dim}'>$ build &amp;&amp; deploy</text>
  <text x='40' y='400' font-family='monospace' font-size='11' fill='${accent}'>✓ shipped to production</text>
  <text x='40' y='470' font-family='monospace' font-size='9' fill='${dim}' letter-spacing='3'>HASSAN.PORTFOLIO/PROJECT</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const projectsChildren: FsNode[] = [
  {
    kind: "file",
    name: "_index.md",
    view: "markdown",
    source: projectsIndexContent,
    language: "Markdown",
  },
  ...projects.map<FsDir>((p) => ({
    kind: "dir",
    name: p.id,
    children: [
      {
        kind: "file",
        name: "README.md",
        view: "markdown",
        source: projectReadme(p),
        language: "Markdown",
      },
      {
        kind: "file",
        name: "stack.md",
        view: "markdown",
        source: projectStack(p),
        language: "Markdown",
      },
      {
        kind: "dir",
        name: "screenshots",
        children: [
          ...(PROJECT_IMAGES[p.id]
            ? [
                {
                  kind: "file" as const,
                  name: "home.png",
                  view: "image" as const,
                  source: PROJECT_IMAGES[p.id],
                  language: "Image",
                },
              ]
            : [
                {
                  kind: "file" as const,
                  name: "home.svg",
                  view: "image" as const,
                  source: screenshotSvg(p.title, "landing view", "acid"),
                  language: "SVG",
                },
              ]),
          {
            kind: "file",
            name: "flow.svg",
            view: "image",
            source: screenshotSvg(p.title, p.stack.join(" · "), "amber"),
            language: "SVG",
          },
        ],
      },
      {
        kind: "file",
        name: "live.url",
        view: "url",
        source: p.href,
        language: "URL",
      },
      ...(p.repo
        ? [
            {
              kind: "file" as const,
              name: "repo.url",
              view: "url" as const,
              source: p.repo,
              language: "URL",
            },
          ]
        : []),
    ],
  })),
];

const resumeMd = `# ${profile.name}

**${profile.role}** · ${profile.location}
${profile.email} · ${profile.socials.map((s) => `[${s.label}](${s.href})`).join(" · ")}

---

## Summary

${profile.bio}

---

## Experience

${experience
  .map(
    (e) => `### ${e.title}${e.org ? ` — ${e.orgHref ? `[${e.org}](${e.orgHref})` : e.org}` : ""}
*${e.period}*

${e.summary}

${e.highlights.map((h) => `- ${h}`).join("\n")}
`,
  )
  .join("\n")}

---

## Selected Work

${projects
  .map(
    (p) => `### ${p.title} — ${p.year}
**${p.role}** · ${p.stack.join(" · ")}

${p.description}

→ ${p.href}
`,
  )
  .join("\n")}

---

## Skills

${(["frontend", "backend", "data", "tooling"] as const)
  .map((group) => {
    const items = skills.filter((s) => s.group === group);
    if (!items.length) return "";
    const label = group.charAt(0).toUpperCase() + group.slice(1);
    return `**${label}** — ${items
      .sort((a, b) => b.weight - a.weight)
      .map((s) => s.label)
      .join(", ")}`;
  })
  .filter(Boolean)
  .join("\n\n")}
`;

const avatarSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400' width='400' height='400'>
  <rect width='400' height='400' fill='#030503'/>
  <circle cx='200' cy='200' r='120' fill='none' stroke='#33ff33' stroke-opacity='0.8'/>
  <circle cx='200' cy='200' r='150' fill='none' stroke='#33ff33' stroke-opacity='0.3'/>
  <text x='200' y='210' font-family='monospace' font-size='48' fill='#33ff33' text-anchor='middle'>${profile.shortName[0]}${profile.name.split(" ").slice(-1)[0][0]}</text>
  <text x='200' y='370' font-family='monospace' font-size='12' fill='#0e8a0e' text-anchor='middle' letter-spacing='3'>${profile.shortName.toUpperCase()}</text>
</svg>`,
)}`;

export const FS: FsDir = {
  kind: "dir",
  name: "portfolio",
  children: [
    {
      kind: "file",
      name: "README.md",
      view: "markdown",
      source: readmeContent,
      language: "Markdown",
      pinned: true,
    },
    {
      kind: "dir",
      name: "about",
      children: [
        {
          kind: "file",
          name: "bio.md",
          view: "markdown",
          source: bioContent,
          language: "Markdown",
        },
        {
          kind: "file",
          name: "timeline.md",
          view: "markdown",
          source: timelineContent,
          language: "Markdown",
        },
        {
          kind: "file",
          name: "skills.md",
          view: "markdown",
          source: skillsContent,
          language: "Markdown",
        },
        {
          kind: "file",
          name: "testimonials.md",
          view: "markdown",
          source: testimonialsContent,
          language: "Markdown",
        },
      ],
    },
    {
      kind: "dir",
      name: "projects",
      children: projectsChildren,
    },
    {
      kind: "dir",
      name: "writing",
      children: [
        {
          kind: "file",
          name: "_index.md",
          view: "markdown",
          source: writingIndexContent,
          language: "Markdown",
        },
        {
          kind: "dir",
          name: "posts",
          children: [
            {
              kind: "file",
              name: "on-shipping.md",
              view: "markdown",
              source: onShippingPost,
              language: "Markdown",
            },
          ],
        },
      ],
    },
    {
      kind: "file",
      name: "resume.pdf",
      view: "pdf",
      source: "/resume/Muhammad-Hassan-Jawwad.pdf",
      language: "PDF",
    },
    {
      kind: "file",
      name: "photo.png",
      view: "image",
      source: "/hassan-pic.png",
      language: "Image",
    },
    {
      kind: "file",
      name: "contact.md",
      view: "form",
      source: contactContent,
      language: "Markdown",
    },
    {
      kind: "dir",
      name: ".config",
      hidden: true,
      children: [
        {
          kind: "file",
          name: "settings.json",
          view: "json",
          source: settingsJson,
          language: "JSON",
        },
        {
          kind: "file",
          name: "keybindings.json",
          view: "json",
          source: keybindings,
          language: "JSON",
        },
      ],
    },
    {
      kind: "dir",
      name: ".secrets",
      hidden: true,
      children: [
        {
          kind: "file",
          name: "README.md",
          view: "markdown",
          source: secretsReadme,
          language: "Markdown",
        },
        {
          kind: "file",
          name: "fortune.md",
          view: "markdown",
          source: fortuneContent,
          language: "Markdown",
        },
      ],
    },
    {
      kind: "file",
      name: ".zshrc",
      view: "markdown",
      source: "```sh\n" + zshrcContent + "\n```",
      language: "Shell",
      hidden: true,
    },
  ],
};

export const HOME_PATH = "/";
export const README_PATH = "/README.md";

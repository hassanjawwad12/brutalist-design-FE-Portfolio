import {
  basename,
  dirname,
  isDir,
  isFile,
  listDir,
  normalizePath,
  pathForDisplay,
  renderTree,
  resolveNode,
  resolvePath,
  walkFiles,
  grepFs,
} from "@/lib/fs";
import { suggestSimilar } from "@/lib/fuzzy";
import type { Dispatch } from "react";
import type { EditorAction, EditorState, TerminalLineKind } from "../ide/store";
import { profile } from "@/data/profile";
import { github } from "@/data/github";
import {
  computeKpis,
  kpisToCard,
  renderKpiCard,
  fetchLiveRepos,
  isCardData,
  type CardData,
} from "@/lib/github-stats";
import { loadGo } from "@/lib/gowasm";

export interface CmdOutputLine {
  kind: TerminalLineKind;
  text: string;
}

export interface CmdContext {
  args: string[];
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  showToast: (text: string) => void;
}

export interface CmdResult {
  output: CmdOutputLine[];
  newCwd?: string;
  silent?: boolean;
  cleared?: boolean;
}

interface CmdDef {
  name: string;
  desc: string;
  usage?: string;
  run: (ctx: CmdContext) => CmdResult | Promise<CmdResult>;
}

const ok = (lines: string[]): CmdOutputLine[] =>
  lines.map((text) => ({ kind: "out" as const, text }));

const err = (text: string): CmdOutputLine[] => [{ kind: "err", text }];

const info = (text: string): CmdOutputLine[] => [{ kind: "info", text }];

const cdCmd: CmdDef = {
  name: "cd",
  desc: "change directory",
  usage: "cd <path>",
  run: ({ args, state }) => {
    const target = args[0] ?? "~";
    const next = resolvePath(state.cwd, target);
    const node = resolveNode(next);
    if (!node) return { output: err(`cd: no such file or directory: ${target}`) };
    if (node.kind !== "dir")
      return { output: err(`cd: not a directory: ${target}`) };
    return { output: [], newCwd: next, silent: true };
  },
};

const pwdCmd: CmdDef = {
  name: "pwd",
  desc: "print working directory",
  run: ({ state }) => ({ output: ok([state.cwd === "/" ? "/" : state.cwd]) }),
};

const lsCmd: CmdDef = {
  name: "ls",
  desc: "list directory contents",
  usage: "ls [path]",
  run: ({ args, state }) => {
    const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
    const longFmt = args.includes("-l") || args.includes("-la") || args.includes("-al");
    const target = args.find((a) => !a.startsWith("-")) ?? state.cwd;
    const path = resolvePath(state.cwd, target);
    const node = resolveNode(path);
    if (!node) return { output: err(`ls: no such path: ${target}`) };
    if (isFile(node)) return { output: ok([node.name]) };
    const entries = listDir(path, showHidden) ?? [];
    if (longFmt) {
      const lines = entries.map((e) => {
        const t = e.kind === "dir" ? "d" : "-";
        const flag = e.hidden ? "h" : "-";
        return `${t}${flag}rwxr-xr-x  ${e.name}${e.kind === "dir" ? "/" : ""}`;
      });
      return { output: ok(lines) };
    }
    return {
      output: ok([
        entries
          .map((e) => (e.kind === "dir" ? `${e.name}/` : e.name))
          .join("  "),
      ]),
    };
  },
};

const catCmd: CmdDef = {
  name: "cat",
  desc: "print file contents",
  usage: "cat <file>",
  run: ({ args, state }) => {
    if (args.length === 0) return { output: err("cat: missing file operand") };
    const out: CmdOutputLine[] = [];
    for (const a of args) {
      const p = resolvePath(state.cwd, a);
      const node = resolveNode(p);
      if (!node) {
        out.push({ kind: "err", text: `cat: ${a}: no such file` });
        continue;
      }
      if (isDir(node)) {
        out.push({ kind: "err", text: `cat: ${a}: is a directory` });
        continue;
      }
      if (isFile(node)) {
        for (const line of node.source.split("\n")) {
          out.push({ kind: "out", text: line });
        }
      }
    }
    return { output: out };
  },
};

const openCmd: CmdDef = {
  name: "open",
  desc: "open a file as an editor tab",
  usage: "open <file>",
  run: ({ args, state, dispatch }) => {
    if (args.length === 0) return { output: err("open: missing file") };
    const p = resolvePath(state.cwd, args[0]);
    const node = resolveNode(p);
    if (!node) return { output: err(`open: ${args[0]}: no such file`) };
    if (isDir(node))
      return { output: err(`open: ${args[0]}: is a directory`) };
    dispatch({ type: "OPEN_TAB", path: p });
    return { output: info(`→ opened ${p}`) };
  },
};

const codeCmd: CmdDef = { ...openCmd, name: "code", desc: "alias for open" };

const helpCmd: CmdDef = {
  name: "help",
  desc: "list available commands",
  run: () => {
    const lines = [
      "available commands:",
      "",
      ...Object.keys(REGISTRY)
        .sort()
        .map((n) => `  ${n.padEnd(10, " ")}  ${REGISTRY[n].desc}`),
      "",
      "tips: ↑/↓ to recall · tab to autocomplete · ctrl+l clears the screen",
    ];
    return { output: ok(lines) };
  },
};

const clearCmd: CmdDef = {
  name: "clear",
  desc: "clear the terminal",
  run: () => ({ output: [], cleared: true }),
};

const whoamiCmd: CmdDef = {
  name: "whoami",
  desc: "one-line bio",
  run: () => ({
    output: ok([`${profile.name} — ${profile.role}, ${profile.location}`]),
  }),
};

const echoCmd: CmdDef = {
  name: "echo",
  desc: "echo arguments",
  run: ({ args }) => ({ output: ok([args.join(" ")]) }),
};

const dateCmd: CmdDef = {
  name: "date",
  desc: "print current date (ISO)",
  run: () => ({ output: ok([new Date().toISOString()]) }),
};

const historyCmd: CmdDef = {
  name: "history",
  desc: "show command history",
  run: ({ state }) => {
    const items = state.commandHistory.slice(-50);
    return {
      output: ok(
        items.map((c, i) => `${(i + 1).toString().padStart(4, " ")}  ${c}`),
      ),
    };
  },
};

const treeCmd: CmdDef = {
  name: "tree",
  desc: "ascii tree of a directory",
  run: ({ args, state }) => {
    const showHidden = args.includes("-a");
    const target = args.find((a) => !a.startsWith("-")) ?? state.cwd;
    const path = resolvePath(state.cwd, target);
    const out = renderTree(path, showHidden, 5);
    if (!out) return { output: err(`tree: ${target}: no such path`) };
    return { output: ok(out.split("\n")) };
  },
};

const grepCmd: CmdDef = {
  name: "grep",
  desc: "search markdown files for a pattern",
  usage: "grep <pattern> [path]",
  run: ({ args, state }) => {
    if (args.length === 0)
      return { output: err("grep: missing pattern. usage: grep <pattern> [path]") };
    const pattern = args[0];
    const target = args[1] ?? "/";
    const root = resolvePath(state.cwd, target);
    const hits = grepFs(pattern, root);
    if (hits.length === 0)
      return { output: info(`grep: no matches for "${pattern}"`) };
    return {
      output: ok(
        hits
          .slice(0, 30)
          .map((h) => `${h.path}:${h.line}: ${h.snippet}`),
      ),
    };
  },
};

const contactCmd: CmdDef = {
  name: "contact",
  desc: "open the contact form",
  run: ({ dispatch, showToast }) => {
    dispatch({ type: "OPEN_TAB", path: "/contact.md" });
    showToast("contact.md opened →");
    return { output: info(`→ ${profile.email}`) };
  },
};

const themeCmd: CmdDef = {
  name: "theme",
  desc: "switch phosphor theme: green | amber | blue",
  usage: "theme <green|amber|blue>",
  run: ({ args, state, dispatch, showToast }) => {
    const valid = ["green", "amber", "blue"] as const;
    if (args.length === 0) {
      return {
        output: ok([
          `current theme: ${state.theme} phosphor`,
          `available: ${valid.join(" · ")}`,
          "usage: theme <name>",
        ]),
      };
    }
    const name = args[0].toLowerCase();
    if (!(valid as readonly string[]).includes(name)) {
      return {
        output: err(`theme: unknown "${args[0]}". try: ${valid.join(", ")}`),
      };
    }
    dispatch({ type: "SET_THEME", theme: name as (typeof valid)[number] });
    showToast(`theme → ${name} phosphor`);
    return { output: info(`→ switched to ${name} phosphor`) };
  },
};

const sudoCmd: CmdDef = {
  name: "sudo",
  desc: "(cheeky permission denied)",
  run: ({ args }) => {
    if (args.join(" ") === "hire-me") {
      return {
        output: ok([
          "→ that's the right command.",
          `   email: ${profile.email}`,
          "   or run `contact` to open the form.",
        ]),
      };
    }
    return {
      output: err(
        `sudo: permission denied. nice try.`,
      ),
    };
  },
};

const vimCmd: CmdDef = {
  name: "vim",
  desc: "(joke)",
  run: ({ dispatch }) => {
    dispatch({ type: "SET_VIM_ACTIVE", active: true });
    return {
      output: info("vim launched. type :q to quit, or press Esc."),
    };
  },
};

const playCmd: CmdDef = {
  name: "play",
  desc: "open the interactive skills playground",
  run: ({ dispatch }) => {
    dispatch({ type: "OPEN_TAB", path: "/about/skills.playground" });
    return { output: info("→ launching skills.playground (rapier physics)") };
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const statsCmd: CmdDef = {
  name: "stats",
  desc: "compute live GitHub KPIs (Go→WASM)",
  run: async ({ dispatch }) => {
    const append = (text: string, kind: TerminalLineKind = "out") =>
      dispatch({ type: "TERMINAL_APPEND", lines: [{ kind, text }] });
    const replace = (text: string, kind: TerminalLineKind) =>
      dispatch({ type: "TERMINAL_REPLACE_LAST", text, kind });

    // 1) Live fetch (animated) with snapshot fallback.
    append("", "info");
    const fetchPromise = fetchLiveRepos();
    for (let i = 0; i < 10; i++) {
      replace(`${SPIN[i % SPIN.length]} querying api.github.com/${github.username} …`, "info");
      await sleep(80);
    }
    const live = await fetchPromise;
    const repos = live ?? github.repos;
    replace(
      `✓ ${repos.length} repositories ${live ? "fetched live" : "(cached snapshot)"}`,
      "out",
    );

    // 2) Compute (animated) — real Go→WASM, with a one-shot retry so a slow
    //    first load never drops to the JS path.
    append("", "info");
    const goPromise = (async () => {
      let g = await loadGo();
      if (!g) {
        await sleep(250);
        g = await loadGo();
      }
      return g;
    })();
    for (let i = 0; i < 8; i++) {
      replace(`${SPIN[i % SPIN.length]} running stats via WebAssembly …`, "info");
      await sleep(80);
    }
    const go = await goPromise;
    let card: CardData;
    let source: string;
    try {
      if (go) {
        const parsed: unknown = JSON.parse(
          go.stats(JSON.stringify({ username: github.username, repos })),
        );
        if (!isCardData(parsed)) throw new Error("unexpected WASM response");
        card = parsed;
        source = `computed via Go → WASM (${go.version()})`;
      } else {
        card = kpisToCard(computeKpis(repos));
        source = "github · live stats";
      }
    } catch {
      card = kpisToCard(computeKpis(repos));
      source = "github · live stats";
    }
    replace(`✓ ${source}`, "out");

    // 3) Render the framed report card.
    const cardLines = renderKpiCard(card, { source, live: !!live });
    return {
      output: cardLines.map((l) => ({
        kind: (l.accent ? "info" : "out") as TerminalLineKind,
        text: l.text,
      })),
    };
  },
};

const gostatsCmd: CmdDef = { ...statsCmd, name: "gostats", desc: "alias for stats" };

const gitCmd: CmdDef = {
  name: "git",
  desc: "fake git for vibes",
  run: ({ args }) => {
    const sub = args[0];
    if (sub === "status")
      return {
        output: ok([
          "On branch main",
          "Your branch is up to date with 'origin/main'.",
          "",
          "nothing to commit, working tree clean",
        ]),
      };
    if (sub === "log")
      return {
        output: ok([
          "commit a1b1c1d (HEAD -> main) — shipped portfolio",
          "Author: " + profile.name,
          "Date:   " + new Date().toUTCString(),
          "",
          "    Build: Terminal/IDE portfolio is live.",
        ]),
      };
    if (sub === "blame")
      return {
        output: ok([
          `${profile.shortName.toLowerCase()}  (you should be working)  this line`,
        ]),
      };
    return { output: info("usage: git <status|log|blame>") };
  },
};

const REGISTRY: Record<string, CmdDef> = Object.fromEntries(
  [
    cdCmd,
    pwdCmd,
    lsCmd,
    catCmd,
    openCmd,
    codeCmd,
    helpCmd,
    clearCmd,
    whoamiCmd,
    echoCmd,
    dateCmd,
    historyCmd,
    treeCmd,
    grepCmd,
    contactCmd,
    themeCmd,
    sudoCmd,
    vimCmd,
    playCmd,
    statsCmd,
    gostatsCmd,
    gitCmd,
  ].map((c) => [c.name, c]),
);

export const runCommand = (
  name: string,
  ctx: CmdContext,
): CmdResult | Promise<CmdResult> => {
  const cmd = REGISTRY[name];
  if (cmd) return cmd.run(ctx);

  // joke: rm -rf /
  if (name === "rm" && ctx.args.join(" ") === "-rf /") {
    return {
      output: [
        { kind: "err", text: "rm: cannot remove '/': operation not permitted" },
        { kind: "info", text: "(also: don't.)" },
      ],
    };
  }

  const suggestion = suggestSimilar(name, Object.keys(REGISTRY));
  const lines: CmdOutputLine[] = [
    { kind: "err", text: `zsh: command not found: ${name}` },
  ];
  if (suggestion)
    lines.push({ kind: "info", text: `did you mean \`${suggestion}\`?` });
  return { output: lines };
};

export const listCommands = (): { name: string; desc: string; usage?: string }[] =>
  Object.values(REGISTRY)
    .map((c) => ({ name: c.name, desc: c.desc, usage: c.usage }))
    .sort((a, b) => a.name.localeCompare(b.name));

// re-exports used by Panel for prompt rendering
export { basename, dirname, normalizePath, pathForDisplay, walkFiles };

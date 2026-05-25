"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "./store";
import { profile } from "@/data/profile";
import { parseCommand } from "@/components/terminal/parser";
import { runCommand } from "@/components/terminal/commands";

type MenuKey = "File" | "Edit" | "View" | "Go" | "Run" | "Terminal" | "Help";

interface MenuItem {
  label: string;
  detail?: string;
  run: () => void;
  divider?: boolean;
}

export function TitleBar() {
  const { state, dispatch, showToast } = useEditor();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const openFile = (path: string) => dispatch({ type: "OPEN_TAB", path });

  const runShell = async (raw: string) => {
    const parsed = parseCommand(raw);
    const promptLine = `${profile.shortName.toLowerCase()}@portfolio:~$ ${raw}`;
    dispatch({ type: "SET_TERMINAL_OPEN", open: true });
    dispatch({
      type: "TERMINAL_APPEND",
      lines: [{ kind: "in", text: promptLine }],
    });
    dispatch({ type: "COMMAND_PUSH", cmd: raw });
    if (!parsed) return;
    const result = await runCommand(parsed.name, {
      args: parsed.args,
      state,
      dispatch,
      showToast,
    });
    if (result.cleared) dispatch({ type: "TERMINAL_CLEAR" });
    if (result.output.length > 0)
      dispatch({ type: "TERMINAL_APPEND", lines: result.output });
    if (result.newCwd) dispatch({ type: "SET_CWD", cwd: result.newCwd });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      showToast(`copied ${profile.email}`);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const MENUS: Record<MenuKey, MenuItem[]> = {
    File: [
      {
        label: "Open README",
        detail: "/README.md",
        run: () => openFile("/README.md"),
      },
      {
        label: "Open Resume",
        detail: "/resume.pdf",
        run: () => openFile("/resume.pdf"),
      },
      {
        label: "Open Contact Form",
        detail: "/contact.md",
        run: () => openFile("/contact.md"),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Settings (JSON)",
        detail: "/.config/settings.json",
        run: () => openFile("/.config/settings.json"),
      },
      {
        label: "Keybindings (JSON)",
        detail: "/.config/keybindings.json",
        run: () => openFile("/.config/keybindings.json"),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Close Active Tab",
        detail: "Cmd+W",
        run: () => {
          if (state.activeTab)
            dispatch({ type: "CLOSE_TAB", path: state.activeTab });
        },
      },
    ],
    Edit: [
      {
        label: "Quick Open File…",
        detail: "Cmd+P",
        run: () => dispatch({ type: "SET_PALETTE", mode: "files" }),
      },
      {
        label: "Find in Files…",
        run: () => {
          dispatch({ type: "SET_SIDEBAR_VIEW", view: "search" });
          dispatch({ type: "SET_SIDEBAR_OPEN", open: true });
        },
      },
      {
        label: "Copy Email",
        detail: profile.email,
        run: copyEmail,
      },
    ],
    View: [
      {
        label: "Toggle Sidebar",
        detail: "Cmd+B",
        run: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
      },
      {
        label: "Toggle Terminal",
        detail: "Cmd+J",
        run: () => dispatch({ type: "TOGGLE_TERMINAL" }),
      },
      {
        label: state.splitTab ? "Close Split Editor" : "Split Editor",
        detail: "Cmd+\\",
        run: () =>
          dispatch({
            type: state.splitTab ? "CLOSE_SPLIT" : "OPEN_SPLIT",
          }),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Show Explorer",
        run: () => dispatch({ type: "SET_SIDEBAR_VIEW", view: "explorer" }),
      },
      {
        label: "Show Search",
        run: () => dispatch({ type: "SET_SIDEBAR_VIEW", view: "search" }),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Plain Semantic View",
        detail: "/simple",
        run: () => {
          window.location.href = "/simple";
        },
      },
    ],
    Go: [
      {
        label: "Quick Open File…",
        detail: "Cmd+P",
        run: () => dispatch({ type: "SET_PALETTE", mode: "files" }),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Go to README",
        run: () => openFile("/README.md"),
      },
      {
        label: "Go to Bio",
        run: () => openFile("/about/bio.md"),
      },
      {
        label: "Go to Timeline",
        run: () => openFile("/about/timeline.md"),
      },
      {
        label: "Go to Projects",
        run: () => openFile("/projects/_index.md"),
      },
      {
        label: "Go to Writing",
        run: () => openFile("/writing/_index.md"),
      },
      {
        label: "Go to Contact",
        run: () => openFile("/contact.md"),
      },
    ],
    Run: [
      {
        label: "Run: help",
        detail: "list commands",
        run: () => runShell("help"),
      },
      {
        label: "Run: whoami",
        detail: "one-line bio",
        run: () => runShell("whoami"),
      },
      {
        label: "Run: tree",
        detail: "ascii directory tree",
        run: () => runShell("tree"),
      },
      {
        label: "Run: git log",
        run: () => runShell("git log"),
      },
      {
        label: "Run: date",
        run: () => runShell("date"),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Command Palette…",
        detail: "Cmd+Shift+P",
        run: () => dispatch({ type: "SET_PALETTE", mode: "commands" }),
      },
    ],
    Terminal: [
      {
        label: state.terminalOpen ? "Hide Terminal" : "Show Terminal",
        detail: "Cmd+J",
        run: () => dispatch({ type: "TOGGLE_TERMINAL" }),
      },
      {
        label: "Clear Terminal",
        detail: "Ctrl+L",
        run: () => {
          dispatch({ type: "SET_TERMINAL_OPEN", open: true });
          dispatch({ type: "TERMINAL_CLEAR" });
        },
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Run: contact",
        run: () => runShell("contact"),
      },
      {
        label: "Run: vim",
        run: () => runShell("vim"),
      },
    ],
    Help: [
      {
        label: "Keybindings (JSON)",
        detail: "/.config/keybindings.json",
        run: () => openFile("/.config/keybindings.json"),
      },
      {
        label: "About this portfolio",
        run: () => openFile("/README.md"),
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "GitHub Profile",
        detail: "↗",
        run: () => {
          const gh = profile.socials.find((s) => s.label === "GitHub");
          if (gh) window.open(gh.href, "_blank", "noreferrer");
        },
      },
      {
        label: "LinkedIn",
        detail: "↗",
        run: () => {
          const li = profile.socials.find((s) => s.label === "LinkedIn");
          if (li) window.open(li.href, "_blank", "noreferrer");
        },
      },
      { label: "", run: () => {}, divider: true },
      {
        label: "Plain Semantic View",
        detail: "/simple",
        run: () => {
          window.location.href = "/simple";
        },
      },
    ],
  };

  const menuKeys = Object.keys(MENUS) as MenuKey[];

  return (
    <div
      className="flex items-center select-none"
      style={{
        height: "var(--h-titlebar)",
        background: "var(--c-titlebar)",
        borderBottom: "1px solid var(--c-border-soft)",
        paddingInline: "var(--space-3)",
        gap: "var(--space-4)",
        flexShrink: 0,
        position: "relative",
      }}
      role="banner"
    >
      <button
        onClick={() => dispatch({ type: "TOGGLE_MOBILE_SIDEBAR" })}
        aria-label="Open menu"
        title="Open file tree"
        className="titlebar-hamburger items-center"
        style={{
          color: "var(--c-acid)",
          textShadow: "var(--text-glow)",
          padding: "2px 8px",
          fontSize: 18,
          letterSpacing: 1,
        }}
      >
        ☰
      </button>

      <div className="flex items-center gap-2">
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: 0,
            background: "transparent",
            border: "1px solid var(--c-acid)",
            boxShadow: "var(--glow-acid)",
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: "var(--c-fg-soft)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {profile.shortName.toLowerCase()}@portfolio
        </span>
      </div>

      <nav
        ref={menuRef}
        aria-label="Editor menus"
        className="titlebar-menus items-center"
        style={{ marginLeft: "var(--space-4)", gap: 0 }}
      >
        {menuKeys.map((m) => {
          const isOpen = openMenu === m;
          return (
            <div key={m} style={{ position: "relative" }}>
              <button
                onClick={() => setOpenMenu(isOpen ? null : m)}
                onMouseEnter={() => {
                  if (openMenu) setOpenMenu(m);
                }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                style={{
                  fontSize: 12,
                  color: isOpen ? "var(--c-acid)" : "var(--c-fg-muted)",
                  textShadow: isOpen ? "var(--text-glow)" : "none",
                  padding: "4px 10px",
                  letterSpacing: "0.04em",
                  background: isOpen
                    ? "rgba(51, 255, 51, 0.08)"
                    : "transparent",
                }}
              >
                {m}
              </button>
              {isOpen && (
                <div
                  role="menu"
                  aria-label={`${m} menu`}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 1px)",
                    left: 0,
                    minWidth: 260,
                    background: "var(--c-black)",
                    border: "1px solid var(--c-acid)",
                    boxShadow: "var(--glow-acid)",
                    zIndex: 50,
                    padding: "var(--space-1) 0",
                  }}
                >
                  {MENUS[m].map((item, i) =>
                    item.divider ? (
                      <div
                        key={`d-${i}`}
                        style={{
                          height: 1,
                          background: "var(--c-border-soft)",
                          margin: "4px 0",
                        }}
                      />
                    ) : (
                      <button
                        key={`${m}-${i}`}
                        role="menuitem"
                        onClick={() => {
                          item.run();
                          setOpenMenu(null);
                        }}
                        className="w-full text-left flex items-center"
                        style={{
                          gap: "var(--space-3)",
                          padding: "6px var(--space-3)",
                          fontSize: "var(--text-xs)",
                          color: "var(--c-paper)",
                          transition:
                            "background var(--dur-fast), color var(--dur-fast)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(51, 255, 51, 0.08)";
                          e.currentTarget.style.color = "var(--c-acid-bright)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--c-paper)";
                        }}
                      >
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.detail && (
                          <span
                            style={{
                              color: "var(--c-fg-muted)",
                              fontSize: 10,
                              letterSpacing: "0.04em",
                            }}
                          >
                            {item.detail}
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center" style={{ gap: "var(--space-3)" }}>
        <div
          className="titlebar-role"
          style={{
            fontSize: 11,
            color: "var(--c-fg-dim)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          — {profile.role} —
        </div>
        <a
          href="/simple"
          title="Plain accessible version"
          style={{
            fontSize: 11,
            color: "var(--c-fg-muted)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "2px 8px",
            border: "1px solid var(--c-border-soft)",
          }}
        >
          ?simple
        </a>
      </div>
    </div>
  );
}

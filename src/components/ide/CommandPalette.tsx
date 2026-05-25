"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "./store";
import { walkFiles, basename } from "@/lib/fs";
import { fuzzyRank } from "@/lib/fuzzy";
import { profile } from "@/data/profile";

interface CommandItem {
  id: string;
  label: string;
  detail?: string;
  run: () => void;
}

export function CommandPalette() {
  const { state, dispatch, showToast } = useEditor();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const open = state.paletteMode !== "closed";

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open, state.paletteMode]);

  const files = useMemo(
    () =>
      walkFiles(undefined, "", true)
        .filter((f) => !basename(f.path).startsWith("."))
        .map((f) => ({
          id: f.path,
          label: f.path,
          detail: f.name,
          run: () => dispatch({ type: "OPEN_TAB", path: f.path }),
        })),
    [dispatch],
  );

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "toggle-terminal",
        label: "View: Toggle Terminal",
        detail: "Cmd+J",
        run: () => dispatch({ type: "TOGGLE_TERMINAL" }),
      },
      {
        id: "toggle-sidebar",
        label: "View: Toggle Sidebar",
        detail: "Cmd+B",
        run: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
      },
      {
        id: "show-explorer",
        label: "View: Show Explorer",
        run: () => dispatch({ type: "SET_SIDEBAR_VIEW", view: "explorer" }),
      },
      {
        id: "show-search",
        label: "View: Show Search",
        run: () => dispatch({ type: "SET_SIDEBAR_VIEW", view: "search" }),
      },
      {
        id: "open-readme",
        label: "Go to README.md",
        run: () => dispatch({ type: "OPEN_TAB", path: "/README.md" }),
      },
      {
        id: "open-contact",
        label: "Go to contact.md",
        run: () => dispatch({ type: "OPEN_TAB", path: "/contact.md" }),
      },
      {
        id: "open-settings",
        label: "Preferences: Open Settings (JSON)",
        run: () =>
          dispatch({ type: "OPEN_TAB", path: "/.config/settings.json" }),
      },
      {
        id: "open-keybindings",
        label: "Preferences: Open Keybindings (JSON)",
        run: () =>
          dispatch({ type: "OPEN_TAB", path: "/.config/keybindings.json" }),
      },
      {
        id: "open-github",
        label: "Open GitHub Profile",
        run: () => {
          const gh = profile.socials.find((s) => s.label === "GitHub");
          if (gh) window.open(gh.href, "_blank", "noreferrer");
        },
      },
      {
        id: "copy-email",
        label: "Copy Email to Clipboard",
        detail: profile.email,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            showToast(`copied ${profile.email}`);
          } catch {
            window.location.href = `mailto:${profile.email}`;
          }
        },
      },
      {
        id: "close-active",
        label: "View: Close Active Tab",
        detail: "Cmd+W",
        run: () => {
          if (state.activeTab)
            dispatch({ type: "CLOSE_TAB", path: state.activeTab });
        },
      },
    ],
    [dispatch, showToast, state.activeTab],
  );

  const source =
    state.paletteMode === "files" ? files : (commands as CommandItem[]);

  const ranked = useMemo(
    () =>
      fuzzyRank(source, query, (i) => `${i.label} ${i.detail ?? ""}`).slice(
        0,
        50,
      ),
    [source, query],
  );

  useEffect(() => {
    if (active >= ranked.length) setActive(0);
  }, [ranked.length, active]);

  if (!open) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(ranked.length - 1, a + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = ranked[active]?.item;
      if (item) {
        item.run();
        dispatch({ type: "SET_PALETTE", mode: "closed" });
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-label={
        state.paletteMode === "files" ? "Quick open" : "Command palette"
      }
      aria-modal="true"
      className="fixed inset-0 flex items-start justify-center"
      style={{
        zIndex: "var(--z-palette)",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        paddingTop: "12vh",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget)
          dispatch({ type: "SET_PALETTE", mode: "closed" });
      }}
    >
      <div
        className="w-full max-w-xl flex flex-col"
        style={{
          background: "var(--c-bg)",
          border: "1px solid var(--c-acid)",
          boxShadow: "var(--glow-acid)",
          maxHeight: "60vh",
        }}
      >
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid var(--c-border-soft)",
          }}
        >
          <div
            style={{
              fontSize: "var(--text-2xs)",
              color: "var(--c-fg-muted)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {state.paletteMode === "files"
              ? "› quick open file"
              : "› command palette"}
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={
              state.paletteMode === "files"
                ? "type to filter files…"
                : "type a command…"
            }
            style={{
              width: "100%",
              color: "var(--c-fg-bright)",
              fontSize: "var(--text-md)",
              padding: 0,
            }}
          />
        </div>
        <div className="overflow-auto flex-1">
          {ranked.length === 0 && (
            <div
              style={{
                padding: "var(--space-4)",
                color: "var(--c-fg-muted)",
                fontSize: "var(--text-sm)",
              }}
            >
              no matches.
            </div>
          )}
          {ranked.map((r, i) => {
            const item = r.item;
            const isActive = i === active;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.run();
                  dispatch({ type: "SET_PALETTE", mode: "closed" });
                }}
                onMouseEnter={() => setActive(i)}
                className="w-full text-left flex items-center gap-3"
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  background: isActive
                    ? "rgba(51, 255, 51, 0.08)"
                    : "transparent",
                  borderLeft: isActive
                    ? "2px solid var(--c-acid)"
                    : "2px solid transparent",
                  fontSize: "var(--text-sm)",
                  color: isActive ? "var(--c-acid-bright)" : "var(--c-paper)",
                  textShadow: isActive ? "var(--text-glow)" : "none",
                }}
              >
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.label}
                </span>
                {item.detail && (
                  <span
                    style={{
                      color: "var(--c-fg-muted)",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {item.detail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

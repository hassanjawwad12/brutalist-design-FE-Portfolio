"use client";

import { useEditor } from "./store";
import { profile } from "@/data/profile";

const MENUS = ["File", "Edit", "View", "Go", "Run", "Terminal", "Help"];

export function TitleBar() {
  const { dispatch } = useEditor();

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
            fontSize: "var(--text-xs)",
            color: "var(--c-fg-soft)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {profile.shortName.toLowerCase()}@portfolio
        </span>
      </div>

      <nav
        aria-label="Editor menus"
        className="titlebar-menus items-center gap-1"
        style={{ marginLeft: "var(--space-4)" }}
      >
        {MENUS.map((m) => (
          <button
            key={m}
            onClick={() => dispatch({ type: "SET_PALETTE", mode: "commands" })}
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--c-fg-muted)",
              padding: "2px 8px",
              letterSpacing: "0.04em",
            }}
            className="hover:!text-[var(--c-acid)] transition-colors"
          >
            {m}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center" style={{ gap: "var(--space-3)" }}>
        <div
          className="titlebar-role"
          style={{
            fontSize: "var(--text-2xs)",
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
            fontSize: "var(--text-2xs)",
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

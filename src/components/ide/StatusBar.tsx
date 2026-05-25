"use client";

import { useEditor } from "./store";
import { basename, pathForDisplay, resolveNode } from "@/lib/fs";
import { profile } from "@/data/profile";

export function StatusBar() {
  const { state, dispatch, showToast } = useEditor();
  const active = state.activeTab ? resolveNode(state.activeTab) : null;
  const language =
    active && active.kind === "file" ? active.language ?? "Plain" : "—";

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      showToast(`copied ${profile.email}`);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const openGithub = () => {
    const gh = profile.socials.find((s) => s.label === "GitHub");
    if (gh) window.open(gh.href, "_blank", "noreferrer");
  };

  return (
    <div
      className="flex items-center select-none"
      style={{
        height: "var(--h-statusbar)",
        background: "var(--c-statusbar)",
        borderTop: "1px solid var(--c-acid)",
        boxShadow: "0 -4px 12px rgba(51,255,51,0.08)",
        fontSize: "var(--text-2xs)",
        letterSpacing: "0.06em",
        color: "var(--c-fg-soft)",
        paddingInline: "var(--space-2)",
        gap: "var(--space-3)",
      }}
      role="contentinfo"
    >
      <button
        onClick={openGithub}
        title="Open GitHub profile"
        style={{ color: "var(--c-acid)", textShadow: "var(--text-glow)" }}
        className="neon-pulse"
      >
        ⎇ main
      </button>
      <span style={{ color: "var(--c-fg-muted)" }}>● 0 ⚠ 0</span>

      <button
        onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
        title="Toggle sidebar (Cmd+B)"
        style={{ color: "var(--c-fg-muted)" }}
      >
        {state.sidebarOpen ? "◫" : "◧"} sidebar
      </button>
      <button
        onClick={() => dispatch({ type: "TOGGLE_TERMINAL" })}
        title="Toggle terminal (Ctrl+`)"
        style={{ color: "var(--c-fg-muted)" }}
      >
        {state.terminalOpen ? "▼" : "▲"} terminal
      </button>

      <div style={{ flex: 1 }} />

      <span style={{ color: "var(--c-fg-muted)" }}>cwd</span>
      <span style={{ color: "var(--c-acid)" }}>{pathForDisplay(state.cwd)}</span>
      <span style={{ color: "var(--c-fg-muted)" }}>·</span>
      <span style={{ color: "var(--c-fg-muted)" }}>
        {state.activeTab ? basename(state.activeTab) : "no file"}
      </span>
      <span style={{ color: "var(--c-fg-muted)" }}>·</span>
      <span style={{ color: "var(--c-fg-muted)" }}>UTF-8</span>
      <span style={{ color: "var(--c-fg-muted)" }}>·</span>
      <span style={{ color: "var(--c-fg-muted)" }}>{language}</span>
      <span style={{ color: "var(--c-fg-muted)" }}>·</span>

      <button
        onClick={copyEmail}
        title="Copy email"
        style={{
          color: "var(--c-amber)",
          textShadow: "var(--text-glow-amber)",
        }}
      >
        ✉ {profile.email}
      </button>
    </div>
  );
}

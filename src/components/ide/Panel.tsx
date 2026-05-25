"use client";

import { useState } from "react";
import { useEditor } from "./store";
import { Terminal } from "../terminal/Terminal";

type PanelTab = "terminal" | "problems" | "output";

const PROBLEMS = [
  {
    severity: "warn",
    text: "Side project debt at >2 (limit: 2). Consider closing some PRs.",
    file: "life.ts:12",
  },
  {
    severity: "info",
    text: "Coffee budget nearing daily threshold.",
    file: "habits.ts:3",
  },
  {
    severity: "info",
    text: "Untested hot take: 'CSS-in-JS is fine for small teams'.",
    file: "opinions.ts:42",
  },
];

const BUILD_LOG = [
  "▲ next build",
  "  ✓ creating an optimized production build",
  "  ✓ compiled successfully",
  "  ✓ collecting page data",
  "  ✓ generating static pages (4/4)",
  "  ✓ finalizing page optimization",
  "",
  "  Route (app)                              Size     First Load JS",
  "  ┌ ○ /                                    14.2 kB         96.4 kB",
  "  ├ ○ /_not-found                           0 B            85.6 kB",
  "  └ ○ /robots.txt                           0 B               0 B",
  "",
  "○  (Static)  prerendered as static content",
  "",
  "✓ Done in 12.4s",
];

function Problems() {
  return (
    <div
      className="flex-1 min-h-0 overflow-auto"
      style={{
        padding: "var(--space-3)",
        fontSize: "var(--text-xs)",
      }}
    >
      {PROBLEMS.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "var(--space-3)",
            padding: "var(--space-2) 0",
            borderBottom: "1px dashed var(--c-border-soft)",
            color: "var(--c-fg-soft)",
          }}
        >
          <span
            style={{
              color:
                p.severity === "warn"
                  ? "var(--c-amber)"
                  : "var(--c-acid)",
              textShadow:
                p.severity === "warn"
                  ? "var(--text-glow-amber)"
                  : "var(--text-glow)",
              width: 60,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {p.severity}
          </span>
          <span style={{ flex: 1 }}>{p.text}</span>
          <span style={{ color: "var(--c-fg-muted)" }}>{p.file}</span>
        </div>
      ))}
    </div>
  );
}

function Output() {
  return (
    <div
      className="flex-1 min-h-0 overflow-auto"
      style={{
        padding: "var(--space-3)",
        fontSize: "var(--text-xs)",
        color: "var(--c-fg-soft)",
      }}
    >
      {BUILD_LOG.map((line, i) => (
        <div
          key={i}
          style={{
            whiteSpace: "pre",
            color:
              line.includes("✓")
                ? "var(--c-acid)"
                : line.startsWith("▲")
                  ? "var(--c-amber)"
                  : undefined,
            textShadow: line.includes("✓") ? "var(--text-glow)" : "none",
          }}
        >
          {line || " "}
        </div>
      ))}
    </div>
  );
}

export function Panel() {
  const { dispatch } = useEditor();
  const [tab, setTab] = useState<PanelTab>("terminal");

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div
        className="flex items-center select-none"
        style={{
          borderBottom: "1px solid var(--c-border-soft)",
          paddingInline: "var(--space-3)",
          gap: "var(--space-4)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          height: 28,
        }}
        role="tablist"
        aria-label="Panel"
      >
        {(["terminal", "problems", "output"] as const).map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              style={{
                color: active ? "var(--c-acid)" : "var(--c-fg-muted)",
                textShadow: active ? "var(--text-glow)" : "none",
                paddingBlock: 6,
                borderBottom: active
                  ? "1px solid var(--c-acid)"
                  : "1px solid transparent",
              }}
            >
              {t}
              {t === "problems" && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "0 5px",
                    background: "var(--c-amber)",
                    color: "var(--c-black)",
                    fontSize: 9,
                    borderRadius: 999,
                  }}
                >
                  {PROBLEMS.length}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button
          aria-label="Close panel"
          onClick={() => dispatch({ type: "SET_TERMINAL_OPEN", open: false })}
          style={{ color: "var(--c-fg-muted)", fontSize: 12 }}
        >
          ×
        </button>
      </div>
      {tab === "terminal" && <Terminal />}
      {tab === "problems" && <Problems />}
      {tab === "output" && <Output />}
    </div>
  );
}

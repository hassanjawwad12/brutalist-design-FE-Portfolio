"use client";

import { useMemo } from "react";
import { useEditor } from "./store";
import { Explorer } from "./Explorer";
import { grepFs } from "@/lib/fs";
import { profile } from "@/data/profile";

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-2xs)",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--c-amber)",
        textShadow: "var(--text-glow-amber)",
        borderBottom: "1px solid rgba(255, 176, 0, 0.2)",
        background: "rgba(255, 176, 0, 0.03)",
      }}
    >
      {label}
    </div>
  );
}

function SearchView() {
  const { state, dispatch } = useEditor();
  const hits = useMemo(() => {
    if (!state.searchQuery.trim()) return [];
    return grepFs(state.searchQuery).slice(0, 80);
  }, [state.searchQuery]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <SectionHeader label="Search" />
      <div style={{ padding: "var(--space-3)" }}>
        <input
          type="text"
          value={state.searchQuery}
          onChange={(e) =>
            dispatch({ type: "SET_SEARCH_QUERY", query: e.target.value })
          }
          placeholder="grep in markdown…"
          aria-label="Search files"
          style={{
            width: "100%",
            background: "var(--c-bg)",
            color: "var(--c-fg)",
            padding: "var(--space-2)",
            border: "1px solid var(--c-border)",
            fontSize: "var(--text-sm)",
          }}
        />
      </div>
      <div className="flex-1 overflow-auto" style={{ paddingInline: "var(--space-2)" }}>
        {state.searchQuery.trim() && hits.length === 0 && (
          <div
            style={{
              padding: "var(--space-3)",
              fontSize: "var(--text-xs)",
              color: "var(--c-fg-muted)",
            }}
          >
            no matches.
          </div>
        )}
        {hits.map((h, i) => (
          <button
            key={`${h.path}-${h.line}-${i}`}
            onClick={() => dispatch({ type: "OPEN_TAB", path: h.path })}
            className="w-full text-left"
            style={{
              display: "block",
              padding: "var(--space-2)",
              marginBottom: 1,
              fontSize: "var(--text-xs)",
              borderLeft: "1px solid transparent",
              transition: "background var(--dur-fast), border-color var(--dur-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--c-bg-elevated)";
              e.currentTarget.style.borderLeftColor = "var(--c-acid)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderLeftColor = "transparent";
            }}
          >
            <div style={{ color: "var(--c-acid)" }}>
              {h.path}:{h.line}
            </div>
            <div
              style={{
                color: "var(--c-fg-soft)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {h.snippet}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SideBar() {
  const { state } = useEditor();

  if (state.sidebarView === "search") return <SearchView />;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <SectionHeader label={`Explorer · ${profile.shortName.toLowerCase()}`} />
      <div className="flex-1 overflow-auto">
        <Explorer />
      </div>
    </div>
  );
}

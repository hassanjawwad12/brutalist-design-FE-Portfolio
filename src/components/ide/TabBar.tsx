"use client";

import { useState } from "react";
import { useEditor } from "./store";
import { basename } from "@/lib/fs";

function fileIcon(name: string): string {
  if (name.endsWith(".md")) return "M";
  if (name.endsWith(".json")) return "{}";
  if (name.endsWith(".url")) return "↗";
  if (name.endsWith(".pdf")) return "P";
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name)) return "▣";
  return "·";
}

function fileIconColor(name: string): string {
  if (name.endsWith(".md")) return "var(--c-acid)";
  if (name.endsWith(".json")) return "var(--c-amber)";
  if (name.endsWith(".url")) return "var(--c-acid-bright)";
  if (name.endsWith(".pdf")) return "var(--c-danger)";
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name))
    return "var(--c-amber-bright)";
  return "var(--c-fg-muted)";
}

export function TabBar() {
  const { state, dispatch } = useEditor();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <div
      role="tablist"
      aria-label="Open files"
      className="flex items-center select-none overflow-x-auto"
      style={{
        height: "var(--h-tabbar)",
        background: "var(--c-bg)",
        borderBottom: "1px solid var(--c-border-soft)",
        flexShrink: 0,
      }}
    >
      {state.openTabs.map((tab, i) => {
        const active = state.activeTab === tab.path && !state.splitFocused;
        const splitActive = state.splitTab === tab.path && state.splitFocused;
        const isActive = active || splitActive;
        const name = basename(tab.path);
        const isDragOver = overIndex === i && dragIndex !== null && dragIndex !== i;

        return (
          <div
            key={tab.path}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            draggable={!tab.pinned}
            onDragStart={(e) => {
              setDragIndex(i);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", tab.path);
            }}
            onDragOver={(e) => {
              if (dragIndex === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIndex !== i) setOverIndex(i);
            }}
            onDragLeave={() => {
              if (overIndex === i) setOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null && dragIndex !== i) {
                dispatch({ type: "REORDER_TABS", from: dragIndex, to: i });
              }
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onClick={() => dispatch({ type: "SET_ACTIVE", path: tab.path })}
            onMouseDown={(e) => {
              if (e.button === 1) {
                e.preventDefault();
                dispatch({ type: "CLOSE_TAB", path: tab.path });
              }
            }}
            className="group flex items-center gap-2 cursor-pointer shrink-0 tab-item"
            style={{
              height: "100%",
              paddingInline: "var(--space-3)",
              background: isActive ? "var(--c-editor)" : "transparent",
              borderRight: "1px solid var(--c-border-soft)",
              borderTop: isActive
                ? "1px solid var(--c-acid)"
                : "1px solid transparent",
              borderLeft: isDragOver
                ? "2px solid var(--c-acid)"
                : "2px solid transparent",
              boxShadow: isActive ? "0 0 12px rgba(51,255,51,0.15)" : "none",
              color: isActive ? "var(--c-fg-bright)" : "var(--c-fg-muted)",
              fontSize: "var(--text-xs)",
              opacity: dragIndex === i ? 0.4 : 1,
              transition:
                "background var(--dur-fast), border-color var(--dur-fast), opacity var(--dur-fast)",
            }}
          >
            <span
              aria-hidden
              style={{
                color: fileIconColor(name),
                fontSize: 10,
                width: 14,
                textAlign: "center",
              }}
            >
              {fileIcon(name)}
            </span>
            <span>{name}</span>
            {tab.dirty && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--c-amber)",
                  boxShadow: "var(--glow-amber)",
                }}
                aria-label="modified"
              />
            )}
            {!tab.pinned && (
              <button
                aria-label={`Close ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "CLOSE_TAB", path: tab.path });
                }}
                className="tab-close"
                style={{ marginLeft: 6, fontSize: 12 }}
              >
                ×
              </button>
            )}
            {tab.pinned && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 9,
                  color: "var(--c-acid)",
                  letterSpacing: "0.1em",
                }}
                aria-label="pinned"
                title="pinned"
              >
                ◉
              </span>
            )}
          </div>
        );
      })}
      <div
        style={{ flex: 1 }}
        onDragOver={(e) => {
          if (dragIndex === null) return;
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragIndex !== null) {
            dispatch({
              type: "REORDER_TABS",
              from: dragIndex,
              to: state.openTabs.length - 1,
            });
          }
          setDragIndex(null);
          setOverIndex(null);
        }}
      />
      {state.activeTab && (
        <button
          onClick={() => {
            if (state.splitTab) {
              dispatch({ type: "CLOSE_SPLIT" });
            } else {
              dispatch({ type: "OPEN_SPLIT" });
            }
          }}
          title={state.splitTab ? "Close split" : "Split editor (Cmd+\\)"}
          aria-label={state.splitTab ? "Close split editor" : "Split editor"}
          style={{
            marginRight: "var(--space-2)",
            color: state.splitTab ? "var(--c-acid)" : "var(--c-fg-muted)",
            fontSize: 14,
            padding: "2px 8px",
            textShadow: state.splitTab ? "var(--text-glow)" : "none",
          }}
        >
          {state.splitTab ? "◫" : "◧"}
        </button>
      )}
    </div>
  );
}

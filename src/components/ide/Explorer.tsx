"use client";

import { useEditor } from "./store";
import { FS, type FsNode } from "@/data/fs";

interface RowProps {
  node: FsNode;
  path: string;
  depth: number;
}

function Row({ node, path, depth }: RowProps) {
  const { state, dispatch } = useEditor();
  const expanded = state.expandedDirs[path] ?? false;
  const active = node.kind === "file" && state.activeTab === path;

  const click = () => {
    if (node.kind === "dir") {
      dispatch({ type: "TOGGLE_DIR", path });
    } else {
      dispatch({ type: "OPEN_TAB", path });
    }
  };

  return (
    <>
      <button
        onClick={click}
        aria-expanded={node.kind === "dir" ? expanded : undefined}
        role={node.kind === "dir" ? "treeitem" : "treeitem"}
        aria-level={depth + 1}
        title={path}
        className="w-full text-left flex items-center group"
        style={{
          paddingInline: "var(--space-2)",
          paddingBlock: 3,
          paddingLeft: `calc(var(--space-2) + ${depth * 14}px)`,
          fontSize: "var(--text-xs)",
          color: active
            ? "var(--c-acid-bright)"
            : node.kind === "dir"
              ? "var(--c-fg-soft)"
              : "var(--c-fg-muted)",
          background: active ? "var(--c-bg-elevated)" : "transparent",
          borderLeft: active
            ? "2px solid var(--c-acid)"
            : "2px solid transparent",
          textShadow: active ? "var(--text-glow)" : "none",
          transition: "background var(--dur-fast), color var(--dur-fast)",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!active)
            e.currentTarget.style.background = "rgba(51, 255, 51, 0.04)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.background = "transparent";
        }}
      >
        {node.kind === "dir" ? (
          <span
            aria-hidden
            style={{
              width: 14,
              textAlign: "center",
              color: "var(--c-acid)",
              fontSize: 10,
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform var(--dur-fast)",
              display: "inline-block",
            }}
          >
            ▶
          </span>
        ) : (
          <span
            aria-hidden
            style={{
              width: 14,
              textAlign: "center",
              color: "var(--c-fg-dim)",
              fontSize: 10,
            }}
          >
            ·
          </span>
        )}
        <span style={{ marginLeft: 4 }}>{node.name}</span>
        {node.hidden && (
          <span
            style={{
              marginLeft: "var(--space-2)",
              fontSize: 9,
              color: "var(--c-fg-dim)",
              letterSpacing: "0.1em",
            }}
          >
            hidden
          </span>
        )}
      </button>
      {node.kind === "dir" &&
        expanded &&
        node.children.map((child) => (
          <Row
            key={child.name}
            node={child}
            path={path === "/" ? `/${child.name}` : `${path}/${child.name}`}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

export function Explorer() {
  return (
    <div role="tree" aria-label="Files" style={{ paddingBlock: "var(--space-2)" }}>
      {FS.children.map((child) => (
        <Row
          key={child.name}
          node={child}
          path={`/${child.name}`}
          depth={0}
        />
      ))}
    </div>
  );
}

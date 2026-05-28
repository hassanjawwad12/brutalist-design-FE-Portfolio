"use client";

import { useEditor } from "./store";
import { resolveNode, basename } from "@/lib/fs";
import { MarkdownView } from "./views/MarkdownView";
import { JsonView } from "./views/JsonView";
import { UrlView } from "./views/UrlView";
import { FormView } from "./views/FormView";
import { ImageView } from "./views/ImageView";
import { PdfView } from "./views/PdfView";
import { SourceView } from "./views/SourceView";
import { SkillsPlayground } from "../playground/SkillsPlayground";

function EditorToolbar({
  showSource,
  onToggle,
}: {
  showSource: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor view mode">
      <div className="editor-toolbar__segment">
        <button
          onClick={() => showSource && onToggle()}
          aria-pressed={!showSource}
          data-active={!showSource}
          title="Rendered preview"
        >
          ▤ preview
        </button>
        <button
          onClick={() => !showSource && onToggle()}
          aria-pressed={showSource}
          data-active={showSource}
          title="Raw source (syntax highlighted)"
        >
          {"</>"} source
        </button>
      </div>
    </div>
  );
}

function NoFile() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center"
      style={{ color: "var(--c-fg-muted)", padding: "var(--space-8)" }}
    >
      <div
        style={{
          fontSize: "var(--text-xl)",
          color: "var(--c-acid)",
          textShadow: "var(--text-glow)",
          marginBottom: "var(--space-3)",
        }}
      >
        no file open
      </div>
      <div style={{ fontSize: "var(--text-sm)" }}>
        <kbd
          style={{
            padding: "2px 6px",
            border: "1px solid var(--c-border)",
            color: "var(--c-acid)",
          }}
        >
          Cmd+P
        </kbd>{" "}
        to open a file, or click one in the explorer →
      </div>
    </div>
  );
}

function NotFound({ path }: { path: string }) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center"
      style={{ color: "var(--c-fg-muted)", padding: "var(--space-8)" }}
    >
      <div
        style={{
          fontSize: "var(--text-xl)",
          color: "var(--c-danger)",
          marginBottom: "var(--space-3)",
        }}
      >
        404 — file not found
      </div>
      <div style={{ fontSize: "var(--text-sm)" }}>
        no such path: <code style={{ color: "var(--c-amber)" }}>{path}</code>
      </div>
    </div>
  );
}

function Pane({ path }: { path: string | null }) {
  const { state, dispatch } = useEditor();

  if (!path) return <NoFile />;
  const node = resolveNode(path);
  if (!node || node.kind !== "file") return <NotFound path={path} />;

  if (node.view === "playground") {
    return (
      <div className="h-full w-full" style={{ background: "var(--c-editor)" }}>
        <SkillsPlayground />
      </div>
    );
  }

  const canToggle = node.view === "markdown" || node.view === "json";
  const showSource = canToggle && !!state.sourceMode[path];

  return (
    <div
      className="h-full w-full flex flex-col min-h-0"
      style={{ background: "var(--c-editor)" }}
    >
      {canToggle && (
        <EditorToolbar
          showSource={showSource}
          onToggle={() => dispatch({ type: "TOGGLE_SOURCE", path })}
        />
      )}
      <div className="flex-1 min-h-0 overflow-auto">
        {showSource ? (
          <SourceView
            source={node.source}
            language={node.language}
            name={basename(path)}
          />
        ) : (
          <>
            {node.view === "markdown" && (
              <MarkdownView source={node.source} title={basename(path)} />
            )}
            {node.view === "json" && <JsonView source={node.source} />}
            {node.view === "url" && (
              <UrlView href={node.source} name={basename(path)} />
            )}
            {node.view === "form" && <FormView />}
            {node.view === "image" && (
              <ImageView source={node.source} name={basename(path)} />
            )}
            {node.view === "pdf" && (
              <PdfView source={node.source} name={basename(path)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function EditorGroup() {
  const { state, dispatch } = useEditor();
  const splitTab = state.splitTab;

  if (!splitTab) {
    return <Pane path={state.activeTab} />;
  }

  return (
    <div className="flex h-full min-h-0">
      <div
        className="flex-1 min-w-0 min-h-0"
        onClick={() => dispatch({ type: "SET_SPLIT_FOCUSED", focused: false })}
        style={{
          borderRight: state.splitFocused
            ? "1px solid var(--c-border-soft)"
            : "1px solid var(--c-acid)",
          boxShadow: state.splitFocused
            ? "none"
            : "inset -2px 0 12px rgba(51,255,51,0.08)",
        }}
      >
        <Pane path={state.activeTab} />
      </div>
      <div
        className="flex-1 min-w-0 min-h-0 relative"
        onClick={() => dispatch({ type: "SET_SPLIT_FOCUSED", focused: true })}
        style={{
          borderLeft: state.splitFocused
            ? "1px solid var(--c-acid)"
            : "1px solid var(--c-border-soft)",
          boxShadow: state.splitFocused
            ? "inset 2px 0 12px rgba(51,255,51,0.08)"
            : "none",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "CLOSE_SPLIT" });
          }}
          title="Close split"
          aria-label="Close split editor"
          style={{
            position: "absolute",
            top: 6,
            right: 8,
            zIndex: 5,
            color: "var(--c-fg-muted)",
            fontSize: 16,
            padding: "0 6px",
            background: "var(--c-bg)",
            border: "1px solid var(--c-border-soft)",
          }}
          className="tab-close"
        >
          ×
        </button>
        <Pane path={splitTab} />
      </div>
    </div>
  );
}

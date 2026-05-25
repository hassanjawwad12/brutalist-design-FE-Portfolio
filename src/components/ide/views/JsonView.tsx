"use client";

import { useState } from "react";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface NodeProps {
  k: string | number | null;
  v: JsonValue;
  depth: number;
  isLast: boolean;
}

function JsonNode({ k, v, depth, isLast }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const indent = depth * 16;

  const keyEl =
    k !== null ? (
      <span
        style={{ color: "var(--c-acid)", textShadow: "var(--text-glow)" }}
      >
        {typeof k === "string" ? `"${k}"` : k}
      </span>
    ) : null;

  if (Array.isArray(v)) {
    return (
      <div style={{ paddingLeft: indent }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ color: "var(--c-fg-muted)" }}
        >
          {open ? "▾" : "▸"}
        </button>{" "}
        {keyEl}
        {keyEl && <span style={{ color: "var(--c-fg-muted)" }}>: </span>}
        <span style={{ color: "var(--c-fg-muted)" }}>
          [{!open && v.length > 0 ? ` ${v.length} items ` : ""}
          {!open ? "]" : ""}
        </span>
        {open && (
          <>
            {v.map((item, i) => (
              <JsonNode
                key={i}
                k={i}
                v={item}
                depth={depth + 1}
                isLast={i === v.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent, color: "var(--c-fg-muted)" }}>
              ]{!isLast && ","}
            </div>
          </>
        )}
      </div>
    );
  }

  if (v !== null && typeof v === "object") {
    const entries = Object.entries(v);
    return (
      <div style={{ paddingLeft: indent }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{ color: "var(--c-fg-muted)" }}
        >
          {open ? "▾" : "▸"}
        </button>{" "}
        {keyEl}
        {keyEl && <span style={{ color: "var(--c-fg-muted)" }}>: </span>}
        <span style={{ color: "var(--c-fg-muted)" }}>
          {"{"}
          {!open && entries.length > 0 ? ` ${entries.length} keys ` : ""}
          {!open ? "}" : ""}
        </span>
        {open && (
          <>
            {entries.map(([key, value], i) => (
              <JsonNode
                key={key}
                k={key}
                v={value}
                depth={depth + 1}
                isLast={i === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: indent, color: "var(--c-fg-muted)" }}>
              {"}"}
              {!isLast && ","}
            </div>
          </>
        )}
      </div>
    );
  }

  const valueColor =
    typeof v === "string"
      ? "var(--c-acid-bright)"
      : typeof v === "number"
        ? "var(--c-amber-bright)"
        : typeof v === "boolean"
          ? "var(--c-amber)"
          : "var(--c-fg-dim)";

  return (
    <div style={{ paddingLeft: indent }}>
      {keyEl && (
        <>
          {keyEl}
          <span style={{ color: "var(--c-fg-muted)" }}>: </span>
        </>
      )}
      <span style={{ color: valueColor }}>
        {typeof v === "string" ? `"${v}"` : String(v)}
      </span>
      {!isLast && <span style={{ color: "var(--c-fg-muted)" }}>,</span>}
    </div>
  );
}

interface Props {
  source: string;
}

export function JsonView({ source }: Props) {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(source);
  } catch {
    return (
      <pre
        style={{
          padding: "var(--space-6)",
          color: "var(--c-danger)",
          fontSize: "var(--text-sm)",
        }}
      >
        Failed to parse JSON
      </pre>
    );
  }
  return (
    <div
      style={{
        padding: "var(--space-6)",
        fontSize: "var(--text-sm)",
        fontFamily: "inherit",
        color: "var(--c-fg-soft)",
        lineHeight: 1.7,
      }}
    >
      <JsonNode k={null} v={parsed} depth={0} isLast />
    </div>
  );
}

"use client";

import { useState } from "react";

interface Props {
  href: string;
  name: string;
}

const parseHostname = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

export function UrlView({ href, name }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const hostname = parseHostname(href);
  const isHttps = href.startsWith("https://");

  return (
    <div
      className="h-full flex flex-col items-center justify-center text-center"
      style={{ padding: "var(--space-8)", gap: "var(--space-3)" }}
    >
      <div
        style={{
          fontSize: "var(--text-2xs)",
          color: "var(--c-amber)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textShadow: "var(--text-glow-amber)",
        }}
      >
        ⚠ external link · {name}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          fontSize: "var(--text-xs)",
        }}
      >
        <span
          style={{
            padding: "2px 6px",
            border: `1px solid ${isHttps ? "var(--c-acid)" : "var(--c-danger)"}`,
            color: isHttps ? "var(--c-acid)" : "var(--c-danger)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {isHttps ? "https" : "http"}
        </span>
        <span style={{ color: "var(--c-fg-muted)" }}>·</span>
        <span style={{ color: "var(--c-fg-soft)" }}>{hostname}</span>
      </div>

      <div
        style={{
          fontSize: "var(--text-lg)",
          color: "var(--c-acid)",
          textShadow: "var(--text-glow)",
          wordBreak: "break-all",
          maxWidth: 600,
        }}
      >
        {href}
      </div>

      <p
        style={{
          color: "var(--c-fg-soft)",
          maxWidth: 520,
          fontSize: "var(--text-sm)",
          lineHeight: 1.6,
          marginTop: "var(--space-2)",
        }}
      >
        This file is a shortcut to an external destination. It will leave the
        portfolio and open <strong style={{ color: "var(--c-fg-bright)" }}>{hostname}</strong>{" "}
        in a new tab.
      </p>

      <div
        className="flex items-center"
        style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}
      >
        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            style={{
              padding: "var(--space-3) var(--space-6)",
              border: "1px solid var(--c-amber)",
              color: "var(--c-amber)",
              textShadow: "var(--text-glow-amber)",
              boxShadow: "var(--glow-amber)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontSize: "var(--text-xs)",
            }}
          >
            ⚠ proceed
          </button>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              padding: "var(--space-3) var(--space-6)",
              border: "1px solid var(--c-acid)",
              color: "var(--c-acid)",
              textShadow: "var(--text-glow)",
              boxShadow: "var(--glow-acid)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontSize: "var(--text-xs)",
            }}
          >
            open ↗
          </a>
        )}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(href);
            } catch {
              /* ignore */
            }
          }}
          style={{
            padding: "var(--space-3) var(--space-4)",
            border: "1px solid var(--c-border)",
            color: "var(--c-fg-muted)",
            fontSize: "var(--text-xs)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          copy
        </button>
      </div>
    </div>
  );
}

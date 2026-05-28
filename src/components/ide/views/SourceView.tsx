"use client";

import { useEffect, useState } from "react";
import { highlightToHtml } from "@/lib/highlighter";

interface Props {
  source: string;
  language?: string;
  name: string;
}

/**
 * Renders raw file source with Shiki syntax highlighting (phosphor theme).
 * Shows an escaped plain-text fallback immediately, then swaps in the
 * highlighted HTML once the (lazily imported) highlighter resolves — so there is
 * no layout shift and it degrades gracefully if Shiki fails to load.
 */
export function SourceView({ source, language, name }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    highlightToHtml(source, language)
      .then((out) => {
        if (alive) setHtml(out);
      })
      .catch(() => {
        /* keep the plain fallback */
      });
    return () => {
      alive = false;
    };
  }, [source, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  const lineCount = source.split("\n").length;

  return (
    <div className="source-view" data-lang={language}>
      <div className="source-view__bar">
        <span className="source-view__meta">
          {name} · {lineCount} lines · {language ?? "Plain"}
        </span>
        <button onClick={copy} className="source-view__copy" title="Copy source">
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      {html ? (
        <div
          className="source-view__code"
          // Shiki output is generated from local file source — not user input.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="source-view__fallback">{source}</pre>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  source: string;
  name: string;
}

const isUrlSource = (s: string): boolean =>
  /^(https?:\/\/|\/)/.test(s.trim()) && !s.includes("\n");

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  .pdf-print-area, .pdf-print-area * { visibility: visible !important; }
  .pdf-print-area {
    position: absolute !important;
    inset: 0 !important;
    padding: 16mm !important;
    background: white !important;
    color: #111 !important;
    box-shadow: none !important;
    border: 0 !important;
  }
  .pdf-print-area * {
    background: transparent !important;
    color: #111 !important;
    text-shadow: none !important;
    box-shadow: none !important;
    border-color: #ccc !important;
  }
  .pdf-print-area a { color: #003366 !important; text-decoration: underline !important; }
  .pdf-print-area h1, .pdf-print-area h2, .pdf-print-area h3 { color: #000 !important; }
}
`;

function PdfIframe({ source, name }: Props) {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoading(true);
  }, [source]);

  const print = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const src = `${source}#zoom=${zoom}&toolbar=0&navpanes=0`;

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--c-editor)" }}
    >
      <div
        className="flex items-center select-none"
        style={{
          padding: "var(--space-2) var(--space-3)",
          borderBottom: "1px solid var(--c-border-soft)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-fg-muted)",
          gap: "var(--space-4)",
        }}
      >
        <span style={{ color: "var(--c-amber)" }}>pdf · {name}</span>
        {loading && (
          <span className="neon-pulse" style={{ color: "var(--c-acid)" }}>
            loading…
          </span>
        )}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid var(--c-border)",
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            style={{ padding: "2px 8px", color: "var(--c-fg-muted)" }}
            aria-label="Zoom out"
          >
            −
          </button>
          <span style={{ color: "var(--c-fg-soft)", fontSize: 10 }}>
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            style={{ padding: "2px 8px", color: "var(--c-fg-muted)" }}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <button
          onClick={print}
          style={{
            color: "var(--c-acid)",
            textShadow: "var(--text-glow)",
            border: "1px solid var(--c-acid)",
            padding: "2px 10px",
            letterSpacing: "0.1em",
          }}
        >
          ⎙ print
        </button>
        <a
          href={source}
          download={name}
          style={{
            color: "var(--c-amber)",
            border: "1px solid var(--c-amber)",
            padding: "2px 10px",
            letterSpacing: "0.1em",
            textShadow: "var(--text-glow-amber)",
          }}
        >
          ↓ download
        </a>
        <a
          href={source}
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: "var(--c-fg-muted)" }}
          title="Open in new tab"
        >
          ↗
        </a>
      </div>
      <div
        className="flex-1 min-h-0 relative"
        style={{
          background: "var(--c-bg)",
          padding: "var(--space-3)",
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title={name}
          onLoad={() => setLoading(false)}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--glow-soft)",
            background: "var(--c-bg-soft)",
          }}
        />
        <noscript>
          <a href={source}>Download {name}</a>
        </noscript>
      </div>
    </div>
  );
}

function PdfMarkdown({ source, name }: Props) {
  const print = () => window.print();

  const download = () => {
    const blob = new Blob([source], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(/\.pdf$/, ".md");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--c-editor)" }}
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />
      <div
        className="flex items-center select-none"
        style={{
          padding: "var(--space-2) var(--space-3)",
          borderBottom: "1px solid var(--c-border-soft)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-fg-muted)",
          gap: "var(--space-4)",
        }}
      >
        <span style={{ color: "var(--c-amber)" }}>pdf · {name}</span>
        <span>page 1 / 1</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={print}
          style={{
            color: "var(--c-acid)",
            textShadow: "var(--text-glow)",
            border: "1px solid var(--c-acid)",
            padding: "2px 10px",
            letterSpacing: "0.1em",
          }}
        >
          ⎙ print / save pdf
        </button>
        <button
          onClick={download}
          style={{ color: "var(--c-fg-muted)" }}
          title="Download as markdown"
        >
          ↓
        </button>
      </div>
      <div
        className="flex-1 overflow-auto"
        style={{
          background: "var(--c-bg)",
          padding: "var(--space-6) var(--space-4)",
        }}
      >
        <div
          className="md pdf-print-area mx-auto"
          style={{
            background: "var(--c-bg-soft)",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--glow-soft)",
            maxWidth: 760,
            padding: "44px 56px",
            minHeight: "calc(100vh - 240px)",
            position: "relative",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--c-fg-dim)",
            }}
          >
            — confidential —
          </div>
          {renderMarkdown(source)}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 12,
              right: 16,
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--c-fg-dim)",
            }}
          >
            page 1 / 1
          </div>
        </div>
      </div>
    </div>
  );
}

export function PdfView({ source, name }: Props) {
  if (isUrlSource(source)) return <PdfIframe source={source} name={name} />;
  return <PdfMarkdown source={source} name={name} />;
}

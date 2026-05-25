"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  source: string;
  name: string;
}

export function ImageView({ source, name }: Props) {
  const [dim, setDim] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState<"fit" | "1x">("fit");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setDim(null);
  }, [source]);

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
        <span style={{ color: "var(--c-amber)" }}>image · {name}</span>
        {dim && (
          <span>
            {dim.w} × {dim.h} px
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setZoom("fit")}
          style={{
            color: zoom === "fit" ? "var(--c-acid)" : "var(--c-fg-muted)",
            textShadow: zoom === "fit" ? "var(--text-glow)" : "none",
          }}
        >
          fit
        </button>
        <button
          onClick={() => setZoom("1x")}
          style={{
            color: zoom === "1x" ? "var(--c-acid)" : "var(--c-fg-muted)",
            textShadow: zoom === "1x" ? "var(--text-glow)" : "none",
          }}
        >
          1:1
        </button>
        <a
          href={source}
          download={name}
          style={{ color: "var(--c-fg-muted)" }}
          title="Download"
        >
          ↓
        </a>
      </div>
      <div
        className="flex-1 overflow-auto flex items-center justify-center"
        style={{
          background:
            "repeating-conic-gradient(rgba(51,255,51,0.04) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px, var(--c-bg)",
          padding: "var(--space-4)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={source}
          alt={name}
          onLoad={(e) =>
            setDim({
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            })
          }
          style={{
            maxWidth: zoom === "fit" ? "100%" : "none",
            maxHeight: zoom === "fit" ? "100%" : "none",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--glow-soft)",
            imageRendering: "auto",
          }}
        />
      </div>
    </div>
  );
}

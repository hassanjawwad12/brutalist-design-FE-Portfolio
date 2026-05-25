"use client";

import { renderMarkdown } from "@/lib/markdown";

interface Props {
  source: string;
  title: string;
}

export function MarkdownView({ source }: Props) {
  return (
    <article
      className="md mx-auto"
      style={{
        padding: "var(--space-8) var(--space-8) var(--space-12)",
        maxWidth: 880,
      }}
    >
      {renderMarkdown(source)}
    </article>
  );
}

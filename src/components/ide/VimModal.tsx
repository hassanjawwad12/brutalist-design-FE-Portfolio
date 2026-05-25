"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "./store";

export function VimModal() {
  const { state, dispatch } = useEditor();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.vimActive) {
      setInput("");
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [state.vimActive]);

  if (!state.vimActive) return null;

  const tryQuit = (raw: string): boolean => {
    const cmd = raw.trim().toLowerCase();
    return cmd === ":q" || cmd === ":q!" || cmd === ":wq" || cmd === ":x";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="vim — joke modal"
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: "var(--z-palette)",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(3px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget)
          dispatch({ type: "SET_VIM_ACTIVE", active: false });
      }}
    >
      <div
        style={{
          width: "min(640px, 90vw)",
          background: "var(--c-bg)",
          border: "1px solid var(--c-acid)",
          boxShadow: "var(--glow-acid)",
          padding: "var(--space-6)",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            fontSize: "var(--text-2xs)",
            color: "var(--c-fg-muted)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "var(--space-3)",
          }}
        >
          ~ ~ ~ ~ ~ vim 9.0 ~ ~ ~ ~ ~
        </div>
        <pre
          style={{
            color: "var(--c-fg-soft)",
            fontSize: "var(--text-xs)",
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
{`~
~     vim is now running.
~
~     to exit:  type  :q  then  Enter
~     also accepts: :q!  :wq  :x
~     or press  Esc
~
~     (yes, really. this is the part everyone struggles with.)
~`}
        </pre>
        <div
          className="flex items-center"
          style={{
            marginTop: "var(--space-4)",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--c-border-soft)",
            gap: 4,
          }}
        >
          <span
            style={{
              color: "var(--c-acid)",
              textShadow: "var(--text-glow)",
              fontSize: "var(--text-xs)",
            }}
          >
            command:
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (tryQuit(input)) {
                  dispatch({ type: "SET_VIM_ACTIVE", active: false });
                }
                setInput("");
              }
            }}
            placeholder=":q"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            style={{
              flex: 1,
              color: "var(--c-fg-bright)",
              fontSize: "var(--text-xs)",
            }}
          />
          <span className="term-caret" aria-hidden />
        </div>
      </div>
    </div>
  );
}

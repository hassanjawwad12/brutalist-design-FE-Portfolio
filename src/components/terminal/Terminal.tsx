"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEditor } from "../ide/store";
import { parseCommand } from "./parser";
import { listCommands, runCommand } from "./commands";
import { completionsFor, pathForDisplay } from "@/lib/fs";
import { profile } from "@/data/profile";

const promptPrefix = (cwd: string) =>
  `${profile.shortName.toLowerCase()}@portfolio:${pathForDisplay(cwd)}$ `;

export function Terminal() {
  const { state, dispatch, showToast } = useEditor();
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.terminalLines]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(
    async (raw: string) => {
      const parsed = parseCommand(raw);
      const promptLine = `${promptPrefix(state.cwd)}${raw}`;
      dispatch({
        type: "TERMINAL_APPEND",
        lines: [{ kind: "in", text: promptLine }],
      });
      if (raw.trim()) dispatch({ type: "COMMAND_PUSH", cmd: raw });
      if (!parsed) return;

      const result = await runCommand(parsed.name, {
        args: parsed.args,
        state,
        dispatch,
        showToast,
      });

      if (result.cleared) {
        dispatch({ type: "TERMINAL_CLEAR" });
      }

      if (result.output.length > 0) {
        dispatch({
          type: "TERMINAL_APPEND",
          lines: result.output.map((l) => ({ kind: l.kind, text: l.text })),
        });
      }
      if (result.newCwd && result.newCwd !== state.cwd) {
        dispatch({ type: "SET_CWD", cwd: result.newCwd });
      }
    },
    [state, dispatch, showToast],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = input;
      setInput("");
      setHistoryIdx(null);
      setDraft("");
      submit(raw);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const hist = state.commandHistory;
      if (hist.length === 0) return;
      const next = historyIdx === null ? hist.length - 1 : Math.max(0, historyIdx - 1);
      if (historyIdx === null) setDraft(input);
      setHistoryIdx(next);
      setInput(hist[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const hist = state.commandHistory;
      if (historyIdx === null) return;
      const next = historyIdx + 1;
      if (next >= hist.length) {
        setHistoryIdx(null);
        setInput(draft);
      } else {
        setHistoryIdx(next);
        setInput(hist[next]);
      }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(" ");
      if (parts.length === 1) {
        const cmds = listCommands()
          .map((c) => c.name)
          .filter((n) => n.startsWith(parts[0]));
        if (cmds.length === 1) setInput(cmds[0] + " ");
        else if (cmds.length > 1) {
          dispatch({
            type: "TERMINAL_APPEND",
            lines: [
              { kind: "in", text: `${promptPrefix(state.cwd)}${input}` },
              { kind: "out", text: cmds.join("  ") },
            ],
          });
        }
        return;
      }
      const last = parts[parts.length - 1];
      const completions = completionsFor(state.cwd, last);
      if (completions.length === 1) {
        parts[parts.length - 1] = completions[0];
        setInput(parts.join(" "));
      } else if (completions.length > 1) {
        dispatch({
          type: "TERMINAL_APPEND",
          lines: [
            { kind: "in", text: `${promptPrefix(state.cwd)}${input}` },
            { kind: "out", text: completions.join("  ") },
          ],
        });
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      dispatch({ type: "TERMINAL_CLEAR" });
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      dispatch({
        type: "TERMINAL_APPEND",
        lines: [{ kind: "in", text: `${promptPrefix(state.cwd)}${input}^C` }],
      });
      setInput("");
      setHistoryIdx(null);
      return;
    }
  };

  const lineColor = (kind: string): string => {
    if (kind === "err") return "var(--c-danger)";
    if (kind === "info") return "var(--c-amber)";
    if (kind === "in") return "var(--c-fg)";
    return "var(--c-fg-soft)";
  };

  const renderedLines = useMemo(
    () =>
      state.terminalLines.map((l) => (
        <div
          key={l.id}
          style={{
            color: lineColor(l.kind),
            whiteSpace: "pre-wrap",
            fontSize: "var(--text-xs)",
            lineHeight: 1.55,
            textShadow:
              l.kind === "in" || l.kind === "info" ? "var(--text-glow)" : "none",
          }}
        >
          {l.text || " "}
        </div>
      )),
    [state.terminalLines],
  );

  return (
    <div
      onClick={focusInput}
      className="flex-1 min-h-0 flex flex-col cursor-text"
      style={{
        background: "var(--c-panel)",
        padding: "var(--space-2) var(--space-3)",
      }}
      role="log"
      aria-live="polite"
      aria-label="Terminal"
    >
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto"
        style={{ fontSize: "var(--text-xs)" }}
      >
        {renderedLines}
        <div
          className="flex items-baseline"
          style={{ marginTop: state.terminalLines.length ? 2 : 0 }}
        >
          <span
            style={{
              color: "var(--c-acid)",
              textShadow: "var(--text-glow)",
              whiteSpace: "pre",
            }}
          >
            {promptPrefix(state.cwd)}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            style={{
              flex: 1,
              color: "var(--c-fg-bright)",
              fontSize: "var(--text-xs)",
              padding: 0,
              caretColor: "transparent",
            }}
          />
          <span className="term-caret" aria-hidden />
        </div>
      </div>
    </div>
  );
}

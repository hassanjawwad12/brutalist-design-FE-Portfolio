"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@/components/ide/store";

const isEditableTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return true;
  if (el.isContentEditable) return true;
  return false;
};

const KONAMI: string[] = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function useGlobalHotkeys() {
  const { state, dispatch, showToast } = useEditor();
  const konamiBufRef = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Konami sequence (track always, including when editable focused — uses real key strings)
      const tracked = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const buf = konamiBufRef.current;
      buf.push(tracked);
      while (buf.length > KONAMI.length) buf.shift();
      if (
        buf.length === KONAMI.length &&
        buf.every((k, i) => k === KONAMI[i])
      ) {
        konamiBufRef.current = [];
        dispatch({ type: "SET_KONAMI", active: true });
        showToast("🐱 ↑↑↓↓←→←→BA");
        window.setTimeout(
          () => dispatch({ type: "SET_KONAMI", active: false }),
          10000,
        );
      }

      // Escape closes palette / vim modal / help overlay
      if (key === "escape") {
        if (state.paletteMode !== "closed") {
          e.preventDefault();
          dispatch({ type: "SET_PALETTE", mode: "closed" });
          return;
        }
        if (state.helpOpen) {
          e.preventDefault();
          dispatch({ type: "SET_HELP", open: false });
          return;
        }
        if (state.vimActive) {
          e.preventDefault();
          dispatch({ type: "SET_VIM_ACTIVE", active: false });
          return;
        }
        if (state.mobileSidebarOpen) {
          e.preventDefault();
          dispatch({ type: "SET_MOBILE_SIDEBAR_OPEN", open: false });
          return;
        }
        return;
      }

      // ? → toggle the shortcuts overlay (ignore while typing)
      if (e.key === "?" && !mod && !isEditableTarget(e.target)) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_HELP" });
        return;
      }

      // Cmd+P → quick open
      if (mod && !e.shiftKey && key === "p") {
        e.preventDefault();
        dispatch({
          type: "SET_PALETTE",
          mode: state.paletteMode === "files" ? "closed" : "files",
        });
        return;
      }

      // Cmd+Shift+P → command palette
      if (mod && e.shiftKey && key === "p") {
        e.preventDefault();
        dispatch({
          type: "SET_PALETTE",
          mode: state.paletteMode === "commands" ? "closed" : "commands",
        });
        return;
      }

      // Cmd+B → toggle sidebar
      if (mod && !e.shiftKey && key === "b") {
        e.preventDefault();
        dispatch({ type: "TOGGLE_SIDEBAR" });
        return;
      }

      // Cmd+J or Ctrl+` → toggle panel
      if (
        (mod && key === "j") ||
        (e.ctrlKey && (e.key === "`" || e.key === "~"))
      ) {
        e.preventDefault();
        dispatch({ type: "TOGGLE_TERMINAL" });
        return;
      }

      // Cmd+\ → split editor
      if (mod && (e.key === "\\" || key === "\\")) {
        e.preventDefault();
        if (state.splitTab) dispatch({ type: "CLOSE_SPLIT" });
        else dispatch({ type: "OPEN_SPLIT" });
        return;
      }

      // Cmd+W → close active tab
      if (mod && key === "w" && !isEditableTarget(e.target)) {
        e.preventDefault();
        if (state.splitFocused && state.splitTab) {
          dispatch({ type: "CLOSE_SPLIT" });
        } else if (state.activeTab) {
          dispatch({ type: "CLOSE_TAB", path: state.activeTab });
        }
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    state.paletteMode,
    state.activeTab,
    state.splitTab,
    state.splitFocused,
    state.vimActive,
    state.mobileSidebarOpen,
    state.helpOpen,
    dispatch,
    showToast,
  ]);
}

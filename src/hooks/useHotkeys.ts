"use client";

import { useEffect, useRef } from "react";

type KeyHandler = (e: KeyboardEvent) => void;
export type HotkeyBindings = Record<string, KeyHandler>;

const isEditable = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement &&
  (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

/**
 * Global keyboard shortcuts. Each key is a combo string mapping to a handler:
 *   "mod+k"  — mod = Cmd (macOS) or Ctrl (elsewhere)
 *   "shift+/", "escape", "k"  — modifiers prefix the lower-cased key.
 * Bare-key shortcuts (no mod) are ignored while typing in a field, so they don't
 * hijack inputs. Bindings are read through a ref, so the listener attaches once
 * and always sees the latest handlers without re-subscribing each render.
 */
export function useHotkeys(bindings: HotkeyBindings): void {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (!mod && isEditable(e.target)) return;
      const combo = `${mod ? "mod+" : ""}${e.shiftKey ? "shift+" : ""}${key}`;
      const handler = ref.current[combo] ?? ref.current[key];
      if (handler) handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

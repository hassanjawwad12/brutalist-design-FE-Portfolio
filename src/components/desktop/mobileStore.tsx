"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APPS, type AppId } from "./apps";

/** How many cards open by default on mobile. The visitor can open as many as
 *  they like from the dock afterwards — this only bounds the initial state. */
const INITIAL_LIMIT = 2;

// Seed with the default-open apps, capped at INITIAL_LIMIT, in dock order.
const INITIAL_OPEN: AppId[] = APPS.filter((a) => a.defaultOpen)
  .slice(0, INITIAL_LIMIT)
  .map((a) => a.id);

interface MobileStackValue {
  /** Open card ids, most-recently-opened first (drives top-of-stack order). */
  open: AppId[];
  isOpen: (id: AppId) => boolean;
  /** Whether an open card's body is collapsed (header still shown). */
  isMinimized: (id: AppId) => boolean;
  /** Dock launcher: open a card, float it to the top, and un-minimize it. */
  openCard: (id: AppId) => void;
  /** Red dot: remove the card from the stack entirely. */
  closeCard: (id: AppId) => void;
  /** Chevron: collapse/restore the card body without removing the card. */
  toggleMinimize: (id: AppId) => void;
}

const MobileStackContext = createContext<MobileStackValue | null>(null);

// Move a card to the top (most-recently-opened), keeping the rest. No cap —
// the visitor can stack as many open cards as they want.
const promote = (prev: AppId[], id: AppId): AppId[] => [
  id,
  ...prev.filter((x) => x !== id),
];

export function MobileStackProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<AppId[]>(INITIAL_OPEN);
  const [minimized, setMinimized] = useState<AppId[]>([]);

  const openCard = useCallback((id: AppId) => {
    setOpen((prev) => (prev[0] === id ? prev : promote(prev, id)));
    setMinimized((prev) => prev.filter((x) => x !== id));
  }, []);

  const closeCard = useCallback((id: AppId) => {
    setOpen((prev) => prev.filter((x) => x !== id));
    setMinimized((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleMinimize = useCallback((id: AppId) => {
    setMinimized((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const value = useMemo<MobileStackValue>(
    () => ({
      open,
      isOpen: (id) => open.includes(id),
      isMinimized: (id) => minimized.includes(id),
      openCard,
      closeCard,
      toggleMinimize,
    }),
    [open, minimized, openCard, closeCard, toggleMinimize],
  );

  return (
    <MobileStackContext.Provider value={value}>
      {children}
    </MobileStackContext.Provider>
  );
}

export function useMobileStack(): MobileStackValue {
  const ctx = useContext(MobileStackContext);
  if (!ctx)
    throw new Error("useMobileStack must be used within <MobileStackProvider>");
  return ctx;
}

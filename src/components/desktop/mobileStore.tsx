"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APPS, type AppId } from "./apps";

/** How many cards open by default on mobile. The user can open as many as they
 *  like from the dock afterwards — this only bounds the initial state. */
const INITIAL_LIMIT = 2;

// Seed with the default-open apps, capped at INITIAL_LIMIT, in dock order.
const INITIAL_OPEN: AppId[] = APPS.filter((a) => a.defaultOpen)
  .slice(0, INITIAL_LIMIT)
  .map((a) => a.id);

interface MobileStackValue {
  /** Expanded card ids, most-recently-opened first (drives top-of-stack order). */
  expanded: AppId[];
  isExpanded: (id: AppId) => boolean;
  /** Expand a card and float it to the top. No-op if already on top. */
  expand: (id: AppId) => void;
  /** Toggle a card; expanding floats it to the top and enforces the cap. */
  toggle: (id: AppId) => void;
}

const MobileStackContext = createContext<MobileStackValue | null>(null);

// Move a card to the top (most-recently-opened), keeping the rest. No cap —
// the visitor can stack as many open cards as they want.
const promote = (prev: AppId[], id: AppId): AppId[] => [
  id,
  ...prev.filter((x) => x !== id),
];

export function MobileStackProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState<AppId[]>(INITIAL_OPEN);

  const expand = useCallback((id: AppId) => {
    setExpanded((prev) => (prev[0] === id ? prev : promote(prev, id)));
  }, []);

  const toggle = useCallback((id: AppId) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : promote(prev, id),
    );
  }, []);

  const value = useMemo<MobileStackValue>(
    () => ({ expanded, isExpanded: (id) => expanded.includes(id), expand, toggle }),
    [expanded, expand, toggle],
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

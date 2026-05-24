"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { THEMES, type Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  brutalist: "Brutalist",
  swiss: "Swiss",
  editorial: "Editorial",
};

const DESCRIPTIONS: Record<Theme, string> = {
  brutalist: "Concrete & acid yellow · glass 3D · physics arena",
  swiss: "Pure monochrome & red · hyper-typographic · no glass",
  editorial: "Cream & burgundy · Instrument Serif headlines",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 border border-[color:var(--c-ink)] px-2.5 py-1.5 mono text-[length:var(--text-2xs)] tracking-[0.2em] text-[color:var(--c-ink)] hover:bg-[color:var(--c-acid)] transition-colors"
      >
        <span className="text-[color:var(--c-ink-muted)]">THEME ·</span>
        <span>{LABELS[theme].toUpperCase()}</span>
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Visual theme"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 border border-[color:var(--c-ink)] bg-[color:var(--c-concrete)] shadow-[4px_4px_0_0_var(--c-ink)] divide-y divide-[color:var(--c-rule-strong)]"
        >
          {THEMES.map((t) => {
            const active = t === theme;
            return (
              <li key={t} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={`group w-full text-left px-3 py-2.5 transition-colors ${
                    active
                      ? "bg-[color:var(--c-acid)] text-[color:var(--c-ink)]"
                      : "hover:bg-[color:var(--c-concrete-deep)] text-[color:var(--c-ink)]"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="mono text-[length:var(--text-xs)] tracking-[0.22em] font-semibold">
                      {LABELS[t].toUpperCase()}
                    </span>
                    {active && (
                      <span
                        aria-hidden
                        className="mono text-[length:var(--text-2xs)] tracking-[0.2em] text-[color:var(--c-ink)]"
                      >
                        ●
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-[length:var(--text-2xs)] leading-snug ${
                      active
                        ? "text-[color:var(--c-ink-soft)]"
                        : "text-[color:var(--c-ink-muted)]"
                    }`}
                  >
                    {DESCRIPTIONS[t]}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { getApp } from "./apps";
import { AppContent } from "./AppContent";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useMobileStack } from "./mobileStore";

/**
 * Mobile / narrow-viewport layout (<768px, windowed desktop hidden). Only the
 * *open* cards are present, newest on top. The dock is the launcher: tapping an
 * icon opens that card and floats it to the top. On each card, the red dot
 * closes it (removes it from the stack) and the chevron minimizes it (collapses
 * the body, keeping the header).
 */
export function MobileStack() {
  const { open, isMinimized, closeCard, toggleMinimize } = useMobileStack();

  return (
    <div className="mstack" data-empty={open.length === 0 || undefined}>
      {open.map((id) => {
        const a = getApp(id);
        const min = isMinimized(id);
        const bodyId = `mstack-body-${id}`;
        const toggleId = `mstack-toggle-${id}`;
        return (
          <GlassPanel
            key={id}
            tone="strong"
            className="mstack__card"
            id={`section-${id}`}
            data-expanded={!min || undefined}
          >
            <header className="mstack__bar">
              <button
                type="button"
                className="mstack__close"
                aria-label={`Close ${a.title}`}
                onClick={() => closeCard(id)}
              />
              <h2 className="mstack__heading">
                <button
                  id={toggleId}
                  type="button"
                  className="mstack__toggle"
                  aria-expanded={!min}
                  aria-controls={bodyId}
                  onClick={() => toggleMinimize(id)}
                >
                  <span
                    className="mstack__icon"
                    style={{ "--tile-hue": a.hue } as CSSProperties}
                  >
                    {a.icon}
                  </span>
                  <span className="mstack__title">{a.title}</span>
                  <svg className="mstack__chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </h2>
            </header>
            <div
              className="mstack__reveal"
              id={bodyId}
              role="region"
              aria-labelledby={toggleId}
              inert={min}
            >
              <div className="mstack__body">
                <AppContent id={id} />
              </div>
            </div>
          </GlassPanel>
        );
      })}
      {open.length === 0 && (
        <p className="mstack__hint">Tap an app in the dock to open it.</p>
      )}
    </div>
  );
}

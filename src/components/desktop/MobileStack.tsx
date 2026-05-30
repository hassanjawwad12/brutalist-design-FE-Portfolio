"use client";

import type { CSSProperties } from "react";
import { getApp } from "./apps";
import { AppContent } from "./AppContent";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useMobileStack } from "./mobileStore";

/**
 * Mobile / narrow-viewport layout (<768px, windowed desktop hidden). Only the
 * *open* cards are present — at most two, newest on top. The dock is the launcher:
 * tapping an icon opens that card (floating it to the top and collapsing the
 * oldest). The chevron on a card collapses it back out of the stack.
 */
export function MobileStack() {
  const { expanded, toggle } = useMobileStack();

  return (
    <div className="mstack" data-empty={expanded.length === 0 || undefined}>
      {expanded.map((id) => {
        const a = getApp(id);
        const bodyId = `mstack-body-${id}`;
        const btnId = `mstack-btn-${id}`;
        return (
          <GlassPanel
            key={id}
            tone="strong"
            className="mstack__card"
            id={`section-${id}`}
            data-expanded
          >
            <h2 className="mstack__heading">
              <button
                id={btnId}
                type="button"
                className="mstack__bar"
                aria-expanded
                aria-controls={bodyId}
                onClick={() => toggle(id)}
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
            <div
              className="mstack__reveal"
              id={bodyId}
              role="region"
              aria-labelledby={btnId}
            >
              <div className="mstack__body">
                <AppContent id={id} />
              </div>
            </div>
          </GlassPanel>
        );
      })}
      {expanded.length === 0 && (
        <p className="mstack__hint">Tap an app in the dock to open it.</p>
      )}
    </div>
  );
}

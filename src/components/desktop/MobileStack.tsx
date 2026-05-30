import type { CSSProperties } from "react";
import { APPS } from "./apps";
import { AppContent } from "./AppContent";
import { GlassPanel } from "@/components/ui/GlassPanel";

/**
 * Mobile / narrow-viewport layout: the OS windows collapse into a vertical scroll
 * of glass cards, one per app. Shown <768px (the windowed desktop is hidden); the
 * dock and ⌘K palette jump here via section ids.
 */
export function MobileStack() {
  return (
    <div className="mstack">
      {APPS.map((a) => (
        <GlassPanel
          key={a.id}
          tone="strong"
          className="mstack__card"
          id={`section-${a.id}`}
        >
          <header className="mstack__bar">
            <span
              className="mstack__icon"
              style={{ "--tile-hue": a.hue } as CSSProperties}
            >
              {a.icon}
            </span>
            <h2 className="mstack__title">{a.title}</h2>
          </header>
          <div className="mstack__body">
            <AppContent id={a.id} />
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

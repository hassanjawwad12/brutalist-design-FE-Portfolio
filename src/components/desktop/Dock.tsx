"use client";

import type { CSSProperties } from "react";
import { APPS, type AppId } from "./apps";
import { useWindowsState, useWindowActions } from "./store";

export function Dock() {
  const { windows, topId } = useWindowsState();
  const { openApp, focusApp, minimizeApp } = useWindowActions();

  const handle = (id: AppId) => {
    const w = windows[id];
    if (!w.open || w.minimized) openApp(id);
    else if (topId === id) minimizeApp(id);
    else focusApp(id);
  };

  return (
    <nav className="dock glass" data-elevation="floating" aria-label="Applications">
      {APPS.map((app) => {
        const w = windows[app.id];
        return (
          <button
            key={app.id}
            type="button"
            className="dock__item"
            data-title={app.title}
            aria-label={app.title}
            aria-pressed={topId === app.id}
            onClick={() => handle(app.id)}
          >
            <span
              className="dock__icon"
              style={{ "--tile-hue": app.hue } as CSSProperties}
            >
              {app.icon}
            </span>
            <span className="dock__dot" data-on={w.open || undefined} aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

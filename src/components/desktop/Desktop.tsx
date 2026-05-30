"use client";

import "./desktop.css";
import { useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Window } from "./Window";
import { MobileStack } from "./MobileStack";
import { CommandPalette } from "./CommandPalette";
import { WindowProvider, useWindowsState } from "./store";
import { MobileStackProvider } from "./mobileStore";
import { APPS } from "./apps";
import { useHotkeys } from "@/hooks/useHotkeys";
import { profile } from "@/data/profile";

function WindowsLayer() {
  const { windows, topId } = useWindowsState();
  return (
    <div className="desktop__windows">
      {APPS.filter((a) => windows[a.id].open && !windows[a.id].minimized).map(
        (a) => (
          <Window
            key={a.id}
            meta={a}
            state={windows[a.id]}
            focused={topId === a.id}
          />
        ),
      )}
    </div>
  );
}

/**
 * Root OS-desktop shell. Renders both the windowed desktop and the mobile stack;
 * CSS shows one per breakpoint (≥768px windows, <768px stack) — no hydration
 * flash. Menu bar, dock, and ⌘K palette are shared chrome.
 */
export function Desktop() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useHotkeys({
    "mod+k": (e) => {
      e.preventDefault();
      setPaletteOpen((o) => !o);
    },
  });

  return (
    <WindowProvider>
      <MobileStackProvider>
        <div className="desktop">
          <h1 className="sr-only">
            {profile.name} — {profile.role}
          </h1>
          <Wallpaper />
          <MenuBar onOpenPalette={() => setPaletteOpen(true)} />
          <WindowsLayer />
          <MobileStack />
          <Dock />
          {paletteOpen && (
            <CommandPalette onClose={() => setPaletteOpen(false)} />
          )}
        </div>
      </MobileStackProvider>
    </WindowProvider>
  );
}

"use client";

import "./desktop.css";
import { useState } from "react";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Window } from "./Window";
import { CommandPalette } from "./CommandPalette";
import { WindowProvider, useWindowsState } from "./store";
import { APPS } from "./apps";
import { useHotkeys } from "@/hooks/useHotkeys";

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
 * Root OS-desktop shell: wallpaper, menu bar, the window layer, the dock, and the
 * ⌘K command palette, all wrapped in the window-manager provider.
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
      <div className="desktop">
        <Wallpaper />
        <MenuBar onOpenPalette={() => setPaletteOpen(true)} />
        <WindowsLayer />
        <Dock />
        {paletteOpen && (
          <CommandPalette onClose={() => setPaletteOpen(false)} />
        )}
      </div>
    </WindowProvider>
  );
}

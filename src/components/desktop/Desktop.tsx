"use client";

import "./desktop.css";
import { Wallpaper } from "./Wallpaper";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { Window } from "./Window";
import { WindowProvider, useWindowsState } from "./store";
import { APPS } from "./apps";

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
 * Root OS-desktop shell: wallpaper, menu bar, the window layer, and the dock,
 * all wrapped in the window-manager provider.
 */
export function Desktop() {
  return (
    <WindowProvider>
      <div className="desktop">
        <Wallpaper />
        <MenuBar />
        <WindowsLayer />
        <Dock />
      </div>
    </WindowProvider>
  );
}

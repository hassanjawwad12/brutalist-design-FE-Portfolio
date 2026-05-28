"use client";

import { useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "./store";
import { TitleBar } from "./TitleBar";
import { ActivityBar } from "./ActivityBar";
import { SideBar } from "./SideBar";
import { TabBar } from "./TabBar";
import { EditorGroup } from "./EditorGroup";
import { Panel } from "./Panel";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { VimModal } from "./VimModal";
import { useGlobalHotkeys } from "@/hooks/useHotkeys";
import { README_PATH } from "@/data/fs";
import { BootScreen } from "./BootScreen";

function Layout({ initialPath }: { initialPath?: string }) {
  const { state, dispatch, showToast } = useEditor();
  useGlobalHotkeys();

  const rootRef = useRef<HTMLDivElement>(null);

  // Open the requested file when arriving via a /p/<path> route.
  const openedInitialRef = useRef(false);
  useEffect(() => {
    if (openedInitialRef.current) return;
    if (!initialPath) return;
    openedInitialRef.current = true;
    dispatch({ type: "OPEN_TAB", path: initialPath });
  }, [initialPath, dispatch]);

  // Resizing sidebar
  const sidebarDragRef = useRef<{ startX: number; startW: number } | null>(
    null,
  );
  const startSidebarResize = (e: React.MouseEvent) => {
    sidebarDragRef.current = { startX: e.clientX, startW: state.sidebarWidth };
    const onMove = (ev: MouseEvent) => {
      if (!sidebarDragRef.current) return;
      const delta = ev.clientX - sidebarDragRef.current.startX;
      const next = Math.max(
        180,
        Math.min(460, sidebarDragRef.current.startW + delta),
      );
      dispatch({ type: "SET_SIDEBAR_WIDTH", width: next });
    };
    const onUp = () => {
      sidebarDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Resizing panel
  const panelDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const startPanelResize = (e: React.MouseEvent) => {
    panelDragRef.current = { startY: e.clientY, startH: state.panelHeight };
    const onMove = (ev: MouseEvent) => {
      if (!panelDragRef.current) return;
      const delta = panelDragRef.current.startY - ev.clientY;
      const next = Math.max(
        120,
        Math.min(520, panelDragRef.current.startH + delta),
      );
      dispatch({ type: "SET_PANEL_HEIGHT", height: next });
    };
    const onUp = () => {
      panelDragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Close the mobile sidebar drawer when a tab becomes active
  const activeTab = state.activeTab;
  useEffect(() => {
    if (state.mobileSidebarOpen)
      dispatch({ type: "SET_MOBILE_SIDEBAR_OPEN", open: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Welcome boot lines — emit only when scrollback is empty
  const bootedRef = useRef(false);
  const terminalEmpty = state.terminalLines.length === 0;
  useEffect(() => {
    if (bootedRef.current) return;
    if (!terminalEmpty) {
      bootedRef.current = true;
      return;
    }
    bootedRef.current = true;
    dispatch({
      type: "TERMINAL_APPEND",
      lines: [
        { kind: "info", text: "portfolio.sh — booted." },
        {
          kind: "info",
          text: "type `help` to see commands, or click any file in the explorer →",
        },
      ],
    });
  }, [dispatch, terminalEmpty]);

  // Keep the URL in sync with the active tab so any file is shareable / deep-linkable.
  // README is treated as "home" (/), everything else maps to /p/<path>.
  useEffect(() => {
    const url =
      state.activeTab && state.activeTab !== README_PATH
        ? `/p${state.activeTab}`
        : "/";
    if (window.location.pathname !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [state.activeTab]);

  // Browser back/forward → open the file encoded in the URL.
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (path === "/" || path === "") {
        dispatch({ type: "SET_ACTIVE", path: README_PATH });
        return;
      }
      if (path.startsWith("/p/")) {
        dispatch({ type: "OPEN_TAB", path: path.slice(2) });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [dispatch]);

  // Internal markdown link interception → open as tab
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest("a[data-internal='true']") as
        | HTMLAnchorElement
        | null;
      if (!link) return;
      e.preventDefault();
      const href = link.getAttribute("href") ?? "";
      const path = href.startsWith("/") ? href : "/" + href;
      dispatch({ type: "OPEN_TAB", path });
    };
    const root = rootRef.current;
    root?.addEventListener("click", onClick);
    return () => root?.removeEventListener("click", onClick);
  }, [dispatch]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-screen w-screen flex-col overflow-hidden"
      style={{ background: "var(--c-black)" }}
    >
      <TitleBar />

      <div className="flex flex-1 min-h-0 relative">
        <ActivityBar />

        {(state.sidebarOpen || state.mobileSidebarOpen) && (
          <>
            <div
              style={{
                width: state.sidebarWidth,
                background: "var(--c-sidebar)",
                borderRight: "1px solid rgba(51, 255, 51, 0.35)",
                boxShadow: "inset -1px 0 0 rgba(51, 255, 51, 0.08)",
              }}
              className="sidebar-container flex flex-col min-h-0"
              data-mobile-open={state.mobileSidebarOpen ? "true" : "false"}
            >
              <SideBar />
            </div>
            <div
              role="separator"
              aria-orientation="vertical"
              className="resizer-v"
              onMouseDown={startSidebarResize}
            />
          </>
        )}

        {state.mobileSidebarOpen && (
          <div
            className="mobile-scrim"
            onClick={() =>
              dispatch({ type: "SET_MOBILE_SIDEBAR_OPEN", open: false })
            }
            aria-hidden
          />
        )}

        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <TabBar />
          <div className="flex-1 min-h-0 overflow-hidden">
            <EditorGroup />
          </div>
          {state.terminalOpen && (
            <>
              <div
                role="separator"
                aria-orientation="horizontal"
                className="resizer-h"
                onMouseDown={startPanelResize}
              />
              <div
                style={{
                  height: state.panelHeight,
                  background: "var(--c-panel)",
                  borderTop: "1px solid var(--c-border-soft)",
                }}
                className="panel-container flex flex-col min-h-0"
              >
                <Panel />
              </div>
            </>
          )}
        </div>
      </div>

      <StatusBar />

      <CommandPalette />
      <VimModal />

      {state.toast && (
        <div className="toast" role="status">
          {state.toast.text}
        </div>
      )}

      <BootScreen />
    </div>
  );
}

export function IdePortfolio({ initialPath }: { initialPath?: string } = {}) {
  return (
    <EditorProvider>
      <Layout initialPath={initialPath} />
    </EditorProvider>
  );
}

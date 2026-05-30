"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { APPS, type AppId } from "./apps";

export interface WindowState {
  id: AppId;
  open: boolean;
  minimized: boolean;
  /** Zoomed to fill the desktop (green light / title-bar double-click). */
  maximized: boolean;
  z: number;
  /** Position only — window size is fixed and lives in the app registry. */
  x: number;
  y: number;
}

interface State {
  windows: Record<AppId, WindowState>;
  topZ: number;
}

type Action =
  | { type: "OPEN"; id: AppId }
  | { type: "CLOSE"; id: AppId }
  | { type: "FOCUS"; id: AppId }
  | { type: "MINIMIZE"; id: AppId }
  | { type: "ZOOM"; id: AppId }
  | { type: "MOVE"; id: AppId; x: number; y: number }
  | { type: "CLOSE_ALL" };

// Window stacking floor. Stays well below --z-chrome (1000) so windows never
// climb over the menu bar / dock.
const BASE_Z = 10;

function createInitialState(): State {
  let z = BASE_Z;
  const windows = {} as Record<AppId, WindowState>;
  for (const app of APPS) {
    const open = Boolean(app.defaultOpen);
    windows[app.id] = {
      id: app.id,
      open,
      minimized: false,
      maximized: false,
      z: open ? ++z : BASE_Z,
      x: app.geometry.x,
      y: app.geometry.y,
    };
  }
  return { windows, topZ: z };
}

function patch(state: State, id: AppId, next: Partial<WindowState>): State {
  return {
    ...state,
    windows: { ...state.windows, [id]: { ...state.windows[id], ...next } },
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN": {
      const topZ = state.topZ + 1;
      return {
        ...patch(state, action.id, { open: true, minimized: false, z: topZ }),
        topZ,
      };
    }
    case "FOCUS": {
      const w = state.windows[action.id];
      if (!w.open || w.minimized || w.z === state.topZ) return state;
      const topZ = state.topZ + 1;
      return { ...patch(state, action.id, { z: topZ }), topZ };
    }
    case "CLOSE":
      return patch(state, action.id, { open: false, minimized: false });
    case "MINIMIZE":
      return patch(state, action.id, { minimized: true });
    case "ZOOM": {
      const w = state.windows[action.id];
      const topZ = state.topZ + 1;
      return {
        ...patch(state, action.id, {
          maximized: !w.maximized,
          minimized: false,
          z: topZ,
        }),
        topZ,
      };
    }
    case "MOVE":
      return patch(state, action.id, { x: action.x, y: action.y });
    case "CLOSE_ALL": {
      const windows = {} as Record<AppId, WindowState>;
      for (const id of Object.keys(state.windows) as AppId[]) {
        windows[id] = { ...state.windows[id], open: false, minimized: false };
      }
      return { ...state, windows };
    }
    default:
      return state;
  }
}

interface WindowsStateValue {
  windows: Record<AppId, WindowState>;
  /** Id of the front-most open, non-minimized window. */
  topId: AppId | null;
}

interface WindowActions {
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  zoomApp: (id: AppId) => void;
  moveApp: (id: AppId, x: number, y: number) => void;
  closeAll: () => void;
}

// State and actions are separate contexts: actions never change identity, so
// action-only consumers (e.g. Window) don't re-render on window-state churn.
const StateContext = createContext<WindowsStateValue | null>(null);
const ActionsContext = createContext<WindowActions | null>(null);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const actions = useMemo<WindowActions>(
    () => ({
      openApp: (id) => dispatch({ type: "OPEN", id }),
      closeApp: (id) => dispatch({ type: "CLOSE", id }),
      focusApp: (id) => dispatch({ type: "FOCUS", id }),
      minimizeApp: (id) => dispatch({ type: "MINIMIZE", id }),
      zoomApp: (id) => dispatch({ type: "ZOOM", id }),
      moveApp: (id, x, y) => dispatch({ type: "MOVE", id, x, y }),
      closeAll: () => dispatch({ type: "CLOSE_ALL" }),
    }),
    [],
  );

  const topId = useMemo<AppId | null>(() => {
    let best: AppId | null = null;
    let bestZ = -Infinity;
    for (const id of Object.keys(state.windows) as AppId[]) {
      const w = state.windows[id];
      if (w.open && !w.minimized && w.z > bestZ) {
        bestZ = w.z;
        best = id;
      }
    }
    return best;
  }, [state.windows]);

  const stateValue = useMemo<WindowsStateValue>(
    () => ({ windows: state.windows, topId }),
    [state.windows, topId],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={stateValue}>
        {children}
      </StateContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useWindowsState(): WindowsStateValue {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error("useWindowsState must be used within <WindowProvider>");
  return ctx;
}

export function useWindowActions(): WindowActions {
  const ctx = useContext(ActionsContext);
  if (!ctx)
    throw new Error("useWindowActions must be used within <WindowProvider>");
  return ctx;
}

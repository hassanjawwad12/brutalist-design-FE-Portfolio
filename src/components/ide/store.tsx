"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { HOME_PATH, README_PATH } from "@/data/fs";

export type TerminalLineKind = "in" | "out" | "err" | "info";

export interface TerminalLine {
  id: number;
  kind: TerminalLineKind;
  text: string;
  cwd?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  submittedAt: number | null;
}

export type SidebarView = "explorer" | "search" | "settings";
export type PaletteMode = "closed" | "files" | "commands";
export type Toast = { id: number; text: string } | null;

export interface Tab {
  path: string;
  dirty: boolean;
  pinned?: boolean;
}

export interface EditorState {
  cwd: string;
  openTabs: Tab[];
  activeTab: string | null;
  splitTab: string | null;
  splitFocused: boolean;
  terminalOpen: boolean;
  sidebarOpen: boolean;
  sidebarView: SidebarView;
  sidebarWidth: number;
  panelHeight: number;
  terminalLines: TerminalLine[];
  commandHistory: string[];
  paletteMode: PaletteMode;
  contactForm: ContactForm;
  toast: Toast;
  expandedDirs: Record<string, boolean>;
  searchQuery: string;
  konamiActive: boolean;
  vimActive: boolean;
  mobileSidebarOpen: boolean;
}

const initialState: EditorState = {
  cwd: HOME_PATH,
  openTabs: [{ path: README_PATH, dirty: false, pinned: true }],
  activeTab: README_PATH,
  splitTab: null,
  splitFocused: false,
  terminalOpen: true,
  sidebarOpen: true,
  sidebarView: "explorer",
  sidebarWidth: 280,
  panelHeight: 240,
  terminalLines: [],
  commandHistory: [],
  paletteMode: "closed",
  contactForm: { name: "", email: "", message: "", submittedAt: null },
  toast: null,
  expandedDirs: { "/": true, "/projects": true, "/about": true },
  searchQuery: "",
  konamiActive: false,
  vimActive: false,
  mobileSidebarOpen: false,
};

export type EditorAction =
  | { type: "OPEN_TAB"; path: string; activate?: boolean }
  | { type: "CLOSE_TAB"; path: string }
  | { type: "SET_ACTIVE"; path: string }
  | { type: "MARK_DIRTY"; path: string; dirty: boolean }
  | { type: "REORDER_TABS"; from: number; to: number }
  | { type: "SET_CWD"; cwd: string }
  | { type: "OPEN_SPLIT"; path?: string }
  | { type: "CLOSE_SPLIT" }
  | { type: "SET_SPLIT_FOCUSED"; focused: boolean }
  | { type: "TOGGLE_TERMINAL" }
  | { type: "SET_TERMINAL_OPEN"; open: boolean }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; open: boolean }
  | { type: "TOGGLE_MOBILE_SIDEBAR" }
  | { type: "SET_MOBILE_SIDEBAR_OPEN"; open: boolean }
  | { type: "SET_SIDEBAR_VIEW"; view: SidebarView }
  | { type: "SET_SIDEBAR_WIDTH"; width: number }
  | { type: "SET_PANEL_HEIGHT"; height: number }
  | { type: "TERMINAL_APPEND"; lines: Omit<TerminalLine, "id">[] }
  | { type: "TERMINAL_CLEAR" }
  | { type: "COMMAND_PUSH"; cmd: string }
  | { type: "SET_PALETTE"; mode: PaletteMode }
  | { type: "CONTACT_UPDATE"; field: keyof Omit<ContactForm, "submittedAt">; value: string }
  | { type: "CONTACT_SUBMIT" }
  | { type: "SET_TOAST"; toast: Toast }
  | { type: "TOGGLE_DIR"; path: string }
  | { type: "SET_DIR_EXPANDED"; path: string; expanded: boolean }
  | { type: "SET_SEARCH_QUERY"; query: string }
  | { type: "SET_KONAMI"; active: boolean }
  | { type: "SET_VIM_ACTIVE"; active: boolean }
  | { type: "HYDRATE"; partial: Partial<EditorState> };

let lineId = 0;
const nextLineId = () => ++lineId;

const reducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case "OPEN_TAB": {
      const exists = state.openTabs.some((t) => t.path === action.path);
      const openTabs = exists
        ? state.openTabs
        : [...state.openTabs, { path: action.path, dirty: false }];
      return {
        ...state,
        openTabs,
        activeTab:
          action.activate === false ? state.activeTab : action.path,
      };
    }
    case "CLOSE_TAB": {
      const idx = state.openTabs.findIndex((t) => t.path === action.path);
      if (idx === -1) return state;
      const tab = state.openTabs[idx];
      if (tab.pinned) return state;
      const openTabs = state.openTabs.filter((_, i) => i !== idx);
      let activeTab = state.activeTab;
      if (state.activeTab === action.path) {
        const next = openTabs[idx] ?? openTabs[idx - 1] ?? openTabs[openTabs.length - 1] ?? null;
        activeTab = next?.path ?? null;
      }
      const splitTab = state.splitTab === action.path ? null : state.splitTab;
      const splitFocused = splitTab === null ? false : state.splitFocused;
      return { ...state, openTabs, activeTab, splitTab, splitFocused };
    }
    case "SET_ACTIVE":
      return { ...state, activeTab: action.path, splitFocused: false };
    case "REORDER_TABS": {
      const { from, to } = action;
      if (from === to) return state;
      const next = [...state.openTabs];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...state, openTabs: next };
    }
    case "OPEN_SPLIT": {
      const path = action.path ?? state.activeTab;
      if (!path) return state;
      const exists = state.openTabs.some((t) => t.path === path);
      const openTabs = exists
        ? state.openTabs
        : [...state.openTabs, { path, dirty: false }];
      return {
        ...state,
        openTabs,
        splitTab: path,
        splitFocused: true,
      };
    }
    case "CLOSE_SPLIT":
      return { ...state, splitTab: null, splitFocused: false };
    case "SET_SPLIT_FOCUSED":
      return { ...state, splitFocused: action.focused };
    case "MARK_DIRTY":
      return {
        ...state,
        openTabs: state.openTabs.map((t) =>
          t.path === action.path ? { ...t, dirty: action.dirty } : t,
        ),
      };
    case "SET_CWD":
      return { ...state, cwd: action.cwd };
    case "TOGGLE_TERMINAL":
      return { ...state, terminalOpen: !state.terminalOpen };
    case "SET_TERMINAL_OPEN":
      return { ...state, terminalOpen: action.open };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR_OPEN":
      return { ...state, sidebarOpen: action.open };
    case "TOGGLE_MOBILE_SIDEBAR":
      return { ...state, mobileSidebarOpen: !state.mobileSidebarOpen };
    case "SET_MOBILE_SIDEBAR_OPEN":
      return { ...state, mobileSidebarOpen: action.open };
    case "SET_SIDEBAR_VIEW":
      return {
        ...state,
        sidebarView: action.view,
        sidebarOpen: true,
      };
    case "SET_SIDEBAR_WIDTH":
      return { ...state, sidebarWidth: action.width };
    case "SET_PANEL_HEIGHT":
      return { ...state, panelHeight: action.height };
    case "TERMINAL_APPEND": {
      const lines = action.lines.map((l) => ({ ...l, id: nextLineId() }));
      return { ...state, terminalLines: [...state.terminalLines, ...lines] };
    }
    case "TERMINAL_CLEAR":
      return { ...state, terminalLines: [] };
    case "COMMAND_PUSH": {
      if (!action.cmd.trim()) return state;
      const filtered = state.commandHistory.filter((c) => c !== action.cmd);
      const next = [...filtered, action.cmd].slice(-200);
      return { ...state, commandHistory: next };
    }
    case "SET_PALETTE":
      return { ...state, paletteMode: action.mode };
    case "CONTACT_UPDATE":
      return {
        ...state,
        contactForm: { ...state.contactForm, [action.field]: action.value },
      };
    case "CONTACT_SUBMIT":
      return {
        ...state,
        contactForm: { ...state.contactForm, submittedAt: Date.now() },
      };
    case "SET_TOAST":
      return { ...state, toast: action.toast };
    case "TOGGLE_DIR":
      return {
        ...state,
        expandedDirs: {
          ...state.expandedDirs,
          [action.path]: !state.expandedDirs[action.path],
        },
      };
    case "SET_DIR_EXPANDED":
      return {
        ...state,
        expandedDirs: { ...state.expandedDirs, [action.path]: action.expanded },
      };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.query };
    case "SET_KONAMI":
      return { ...state, konamiActive: action.active };
    case "SET_VIM_ACTIVE":
      return { ...state, vimActive: action.active };
    case "HYDRATE":
      return { ...state, ...action.partial };
    default:
      return state;
  }
};

interface EditorContextValue {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  showToast: (text: string, durationMs?: number) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

const STORAGE_KEY = "ide-portfolio:v1";

interface PersistedState {
  commandHistory: string[];
  sidebarWidth: number;
  panelHeight: number;
  expandedDirs: Record<string, boolean>;
}

const loadPersisted = (): Partial<PersistedState> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persist = (state: EditorState) => {
  if (typeof window === "undefined") return;
  try {
    const data: PersistedState = {
      commandHistory: state.commandHistory,
      sidebarWidth: state.sidebarWidth,
      panelHeight: state.panelHeight,
      expandedDirs: state.expandedDirs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) dispatch({ type: "HYDRATE", partial: persisted });
  }, []);

  useEffect(() => {
    persist(state);
  }, [
    state.commandHistory,
    state.sidebarWidth,
    state.panelHeight,
    state.expandedDirs,
  ]);

  const showToast = useCallback((text: string, durationMs = 2200) => {
    const id = Date.now();
    dispatch({ type: "SET_TOAST", toast: { id, text } });
    window.setTimeout(() => {
      dispatch({
        type: "SET_TOAST",
        toast: null,
      });
    }, durationMs);
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, showToast }),
    [state, dispatch, showToast],
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}

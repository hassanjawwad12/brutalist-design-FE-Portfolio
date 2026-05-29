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
import { resolveNode } from "@/lib/fs";

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
export type PanelTab = "terminal" | "problems" | "output";
export type ThemeName = "green" | "amber" | "blue";
export const THEMES: ThemeName[] = ["green", "amber", "blue"];
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
  panelTab: PanelTab;
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
  sourceMode: Record<string, boolean>;
  theme: ThemeName;
  helpOpen: boolean;
}

const initialState: EditorState = {
  cwd: HOME_PATH,
  openTabs: [{ path: README_PATH, dirty: false, pinned: true }],
  activeTab: README_PATH,
  splitTab: null,
  splitFocused: false,
  terminalOpen: true,
  panelTab: "terminal",
  sidebarOpen: true,
  sidebarView: "explorer",
  sidebarWidth: 280,
  panelHeight: 240,
  terminalLines: [],
  commandHistory: [],
  paletteMode: "closed",
  contactForm: { name: "", email: "", message: "", submittedAt: null },
  toast: null,
  expandedDirs: { "/": true, "/projects": true, "/about": true, "/github": true },
  searchQuery: "",
  konamiActive: false,
  vimActive: false,
  mobileSidebarOpen: false,
  sourceMode: {},
  theme: "green",
  helpOpen: false,
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
  | { type: "SET_PANEL_TAB"; tab: PanelTab }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; open: boolean }
  | { type: "TOGGLE_MOBILE_SIDEBAR" }
  | { type: "SET_MOBILE_SIDEBAR_OPEN"; open: boolean }
  | { type: "SET_SIDEBAR_VIEW"; view: SidebarView }
  | { type: "SET_SIDEBAR_WIDTH"; width: number }
  | { type: "SET_PANEL_HEIGHT"; height: number }
  | { type: "TERMINAL_APPEND"; lines: Omit<TerminalLine, "id">[] }
  | { type: "TERMINAL_REPLACE_LAST"; text: string; kind?: TerminalLineKind }
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
  | { type: "TOGGLE_SOURCE"; path: string }
  | { type: "SET_THEME"; theme: ThemeName }
  | { type: "SET_HELP"; open: boolean }
  | { type: "TOGGLE_HELP" }
  | { type: "HYDRATE"; partial: Partial<EditorState> };

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
    case "SET_PANEL_TAB":
      return { ...state, panelTab: action.tab, terminalOpen: true };
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
      const lastId = state.terminalLines.at(-1)?.id ?? 0;
      const lines = action.lines.map((l, i) => ({ ...l, id: lastId + i + 1 }));
      return { ...state, terminalLines: [...state.terminalLines, ...lines] };
    }
    case "TERMINAL_REPLACE_LAST": {
      if (state.terminalLines.length === 0) return state;
      const lines = state.terminalLines.slice();
      const last = lines[lines.length - 1];
      lines[lines.length - 1] = {
        ...last,
        text: action.text,
        kind: action.kind ?? last.kind,
      };
      return { ...state, terminalLines: lines };
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
    case "TOGGLE_SOURCE":
      return {
        ...state,
        sourceMode: {
          ...state.sourceMode,
          [action.path]: !state.sourceMode[action.path],
        },
      };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "SET_HELP":
      return { ...state, helpOpen: action.open };
    case "TOGGLE_HELP":
      return { ...state, helpOpen: !state.helpOpen };
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
  openTabs: Tab[];
  activeTab: string | null;
  theme: ThemeName;
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
      openTabs: state.openTabs,
      activeTab: state.activeTab,
      theme: state.theme,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
};

// Restore only tabs that still resolve to real files, always keep README pinned,
// and ensure the active tab is one of the restored tabs.
const sanitizeTabs = (
  persisted: Partial<PersistedState>,
): { openTabs: Tab[]; activeTab: string } | null => {
  if (!Array.isArray(persisted.openTabs)) return null;
  const valid: Tab[] = persisted.openTabs
    .filter((t): t is Tab => {
      if (!t || typeof t.path !== "string") return false;
      const node = resolveNode(t.path);
      return !!node && node.kind === "file";
    })
    .map((t) => ({
      path: t.path,
      dirty: false,
      pinned: t.path === README_PATH ? true : !!t.pinned,
    }));

  if (!valid.some((t) => t.path === README_PATH)) {
    valid.unshift({ path: README_PATH, dirty: false, pinned: true });
  }

  const activeTab =
    typeof persisted.activeTab === "string" &&
    valid.some((t) => t.path === persisted.activeTab)
      ? persisted.activeTab
      : README_PATH;

  return { openTabs: valid, activeTab };
};

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const persisted = loadPersisted();
    if (!persisted) return;
    const partial: Partial<EditorState> = {};
    if (Array.isArray(persisted.commandHistory))
      partial.commandHistory = persisted.commandHistory;
    if (typeof persisted.sidebarWidth === "number")
      partial.sidebarWidth = persisted.sidebarWidth;
    if (typeof persisted.panelHeight === "number")
      partial.panelHeight = persisted.panelHeight;
    if (persisted.expandedDirs) partial.expandedDirs = persisted.expandedDirs;
    if (
      persisted.theme === "green" ||
      persisted.theme === "amber" ||
      persisted.theme === "blue"
    )
      partial.theme = persisted.theme;
    const tabs = sanitizeTabs(persisted);
    if (tabs) {
      partial.openTabs = tabs.openTabs;
      partial.activeTab = tabs.activeTab;
    }
    dispatch({ type: "HYDRATE", partial });
  }, []);

  useEffect(() => {
    persist(state);
  }, [
    state.commandHistory,
    state.sidebarWidth,
    state.panelHeight,
    state.expandedDirs,
    state.openTabs,
    state.activeTab,
    state.theme,
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

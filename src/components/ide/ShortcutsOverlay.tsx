"use client";

import { useEditor } from "./store";

interface Shortcut {
  keys: string;
  label: string;
}

const EDITOR: Shortcut[] = [
  { keys: "⌘/Ctrl P", label: "Quick open file" },
  { keys: "⌘/Ctrl ⇧ P", label: "Command palette" },
  { keys: "⌘/Ctrl B", label: "Toggle sidebar" },
  { keys: "⌘/Ctrl J  ·  Ctrl `", label: "Toggle terminal" },
  { keys: "⌘/Ctrl \\", label: "Split editor" },
  { keys: "⌘/Ctrl W", label: "Close tab" },
  { keys: "?", label: "This help" },
  { keys: "Esc", label: "Close dialogs" },
];

const TERMINAL: Shortcut[] = [
  { keys: "help", label: "List all commands" },
  { keys: "stats", label: "Live GitHub KPIs (Go→WASM)" },
  { keys: "play", label: "Skills physics playground" },
  { keys: "tree · ls · cat", label: "Explore the filesystem" },
  { keys: "theme <name>", label: "green · amber · blue phosphor" },
  { keys: "↑ / ↓", label: "Command history" },
  { keys: "Tab", label: "Autocomplete" },
  { keys: "Ctrl L", label: "Clear terminal" },
];

function Column({ title, items }: { title: string; items: Shortcut[] }) {
  return (
    <div className="shortcuts__col">
      <h3 className="shortcuts__title">{title}</h3>
      <ul className="shortcuts__list">
        {items.map((s) => (
          <li key={s.keys} className="shortcuts__row">
            <kbd className="shortcuts__keys">{s.keys}</kbd>
            <span className="shortcuts__label">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ShortcutsOverlay() {
  const { state, dispatch } = useEditor();
  if (!state.helpOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="shortcuts"
      onClick={(e) => {
        if (e.target === e.currentTarget)
          dispatch({ type: "SET_HELP", open: false });
      }}
    >
      <div className="shortcuts__panel">
        <div className="shortcuts__header">
          <span className="shortcuts__heading">keyboard shortcuts</span>
          <button
            className="shortcuts__close"
            onClick={() => dispatch({ type: "SET_HELP", open: false })}
            aria-label="Close"
          >
            esc ✕
          </button>
        </div>
        <div className="shortcuts__cols">
          <Column title="Editor" items={EDITOR} />
          <Column title="Terminal" items={TERMINAL} />
        </div>
      </div>
    </div>
  );
}

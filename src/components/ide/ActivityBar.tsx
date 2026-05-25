"use client";

import { useEditor, type SidebarView } from "./store";
import { profile } from "@/data/profile";

interface Item {
  id: SidebarView | "github" | "settings-link";
  label: string;
  icon: React.ReactNode;
}

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  explorer: "M4 5h6l2 2h8v12H4z",
  search: "M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm5 11l5 5",
  github:
    "M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.3-.3-4.6-1.1-4.6-5 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.8 1 .8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c1.9-1.3 2.8-1 2.8-1 .6 1.4.2 2.5.1 2.8.7.7 1.1 1.6 1.1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5C19.1 20.2 22 16.4 22 12 22 6.5 17.5 2 12 2z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-6v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M6.34 17.66l-1.41 1.41m12.73 0-1.41-1.41M6.34 6.34 4.93 4.93",
};

export function ActivityBar() {
  const { state, dispatch } = useEditor();

  const items: Item[] = [
    { id: "explorer", label: "Explorer", icon: <Icon d={ICONS.explorer} /> },
    { id: "search", label: "Search", icon: <Icon d={ICONS.search} /> },
    { id: "github", label: "GitHub", icon: <Icon d={ICONS.github} /> },
    { id: "settings-link", label: "Settings", icon: <Icon d={ICONS.settings} /> },
  ];

  const handle = (id: Item["id"]) => {
    if (id === "github") {
      const gh = profile.socials.find((s) => s.label === "GitHub");
      if (gh) window.open(gh.href, "_blank", "noreferrer");
      return;
    }
    if (id === "settings-link") {
      dispatch({ type: "OPEN_TAB", path: "/.config/settings.json" });
      return;
    }
    if (state.sidebarView === id && state.sidebarOpen) {
      dispatch({ type: "TOGGLE_SIDEBAR" });
    } else {
      dispatch({ type: "SET_SIDEBAR_VIEW", view: id });
    }
  };

  const KONAMI_EMOJI = ["🐱", "🐈", "😺", "😸"];

  return (
    <div
      className="flex flex-col items-center select-none activity-bar"
      style={{
        width: "var(--w-activitybar)",
        background: "var(--c-black)",
        borderRight: "1px solid rgba(51, 255, 51, 0.18)",
        paddingBlock: "var(--space-2)",
      }}
      role="toolbar"
      aria-label="Activity"
    >
      {items.map((item, i) => {
        const active =
          state.sidebarOpen &&
          (item.id === "explorer" || item.id === "search") &&
          state.sidebarView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handle(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-pressed={active}
            className="relative w-full flex items-center justify-center"
            style={{
              height: "var(--w-activitybar)",
              color: active ? "var(--c-acid)" : "var(--c-fg-muted)",
              textShadow: active ? "var(--text-glow)" : "none",
              borderLeft: active
                ? "2px solid var(--c-acid)"
                : "2px solid transparent",
              transition: "color var(--dur-fast)",
              fontSize: state.konamiActive ? 22 : undefined,
            }}
          >
            {state.konamiActive ? KONAMI_EMOJI[i % KONAMI_EMOJI.length] : item.icon}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { APPS } from "./apps";
import { useWindowActions } from "./store";
import { profile } from "@/data/profile";
import { fuzzyRank } from "@/lib/fuzzy";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Icon } from "@/components/ui/Icon";

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: ReactNode;
  run: () => void;
}

const ICON_SEARCH = (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);
const ICON_LINK = (
  <Icon>
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </Icon>
);
const ICON_MAIL = (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </Icon>
);
const ICON_DOC = (
  <Icon>
    <path d="M6 2h8l4 4v16H6z" />
    <path d="M14 2v4h4" />
  </Icon>
);
const ICON_CLOSE = (
  <Icon>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

const openExternal = (href: string) =>
  window.open(href, "_blank", "noopener,noreferrer");

interface CommandPaletteProps {
  /** Mounted only while open (parent gates), so closing it resets all state. */
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const actions = useWindowActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const commands = useMemo<Command[]>(
    () => [
      ...APPS.map((a) => ({
        id: `app-${a.id}`,
        label: `Open ${a.title}`,
        hint: "App",
        icon: a.icon,
        run: () => actions.openApp(a.id),
      })),
      ...profile.socials.map((s) => ({
        id: `link-${s.label}`,
        label: s.label,
        hint: "Link",
        icon: ICON_LINK,
        run: () => openExternal(s.href),
      })),
      {
        id: "email",
        label: "Email me",
        hint: "Link",
        icon: ICON_MAIL,
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      },
      {
        id: "resume",
        label: "Download résumé",
        hint: "PDF",
        icon: ICON_DOC,
        run: () => openExternal(profile.resumeHref),
      },
      {
        id: "simple",
        label: "Plain-text version",
        hint: "Page",
        icon: ICON_DOC,
        run: () => openExternal("/simple"),
      },
      {
        id: "close-all",
        label: "Close all windows",
        hint: "Action",
        icon: ICON_CLOSE,
        run: () => actions.closeAll(),
      },
    ],
    [actions],
  );

  const visible = useMemo(
    () => fuzzyRank(commands, query, (c) => c.label).map((m) => m.item),
    [commands, query],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    cmd.run();
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, visible.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(visible[selected]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const onBackdrop = (e: PointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const activeId = visible[selected] ? `cmd-${visible[selected].id}` : undefined;

  return (
    <div className="palette" role="presentation" onPointerDown={onBackdrop}>
      <GlassPanel
        tone="strong"
        elevation="floating"
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="palette__search">
          {ICON_SEARCH}
          <input
            ref={inputRef}
            className="palette__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={activeId}
            placeholder="Search apps, links, actions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        <ul className="palette__list" id="palette-list" role="listbox">
          {visible.length === 0 ? (
            <li className="palette__empty" role="presentation">
              No matches
            </li>
          ) : (
            visible.map((cmd, i) => {
              const isSelected = i === selected;
              return (
                <li
                  key={cmd.id}
                  id={`cmd-${cmd.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className="palette__item"
                  data-selected={isSelected || undefined}
                  onPointerEnter={() => setSelected(i)}
                  onClick={() => run(cmd)}
                >
                  <span className="palette__icon">{cmd.icon}</span>
                  <span className="palette__label">{cmd.label}</span>
                  <span className="palette__hint">{cmd.hint}</span>
                </li>
              );
            })
          )}
        </ul>

        <footer className="palette__footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </footer>
      </GlassPanel>
    </div>
  );
}

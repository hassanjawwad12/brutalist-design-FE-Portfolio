"use client";

import { memo, useEffect, useRef } from "react";
import type { AppMeta, AppId } from "./apps";
import { useWindowActions, type WindowState } from "./store";
import { useDrag } from "@/hooks/useDrag";
import { AppContent } from "./AppContent";

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

const LIGHTS = [
  { cls: "close", label: "Close", action: "close" },
  { cls: "min", label: "Minimize", action: "minimize" },
  { cls: "zoom", label: "Reset position of", action: "reset" },
] as const;

interface WindowProps {
  meta: AppMeta;
  state: WindowState;
  focused: boolean;
}

function WindowImpl({ meta, state, focused }: WindowProps) {
  const { focusApp, closeApp, minimizeApp, resetApp, moveApp } =
    useWindowActions();
  const rootRef = useRef<HTMLElement>(null);
  const { w, h } = meta.geometry;

  // Keep a window's position inside the desktop bounds (fixed size from registry).
  const clampPosition = (x: number, y: number) => {
    const parent = rootRef.current?.parentElement;
    const pw = parent?.clientWidth ?? window.innerWidth;
    const ph = parent?.clientHeight ?? window.innerHeight;
    return {
      x: clamp(x, 0, Math.max(0, pw - w)),
      y: clamp(y, 0, Math.max(0, ph - h)),
    };
  };

  const { dragging, onPointerDown } = useDrag({
    targetRef: rootRef,
    onStart: () => focusApp(meta.id),
    onCommit: (dx, dy) => {
      const p = clampPosition(state.x + dx, state.y + dy);
      moveApp(meta.id, p.x, p.y);
    },
  });

  // Pull a window that opened off-screen (small viewport) back into view, once.
  useEffect(() => {
    const p = clampPosition(state.x, state.y);
    if (p.x !== state.x || p.y !== state.y) moveApp(meta.id, p.x, p.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLight: Record<(typeof LIGHTS)[number]["action"], (id: AppId) => void> =
    { close: closeApp, minimize: minimizeApp, reset: resetApp };
  const titleId = `win-${meta.id}-title`;

  return (
    <section
      ref={rootRef}
      className="glass window"
      data-tone="strong"
      data-focused={focused || undefined}
      data-dragging={dragging || undefined}
      role="dialog"
      aria-labelledby={titleId}
      style={{ left: state.x, top: state.y, width: w, height: h, zIndex: state.z }}
      onPointerDownCapture={() => focusApp(meta.id)}
    >
      <header className="window__bar" onPointerDown={onPointerDown}>
        <div className="window__lights">
          {LIGHTS.map((l) => (
            <button
              key={l.cls}
              type="button"
              className={`window__light window__light--${l.cls}`}
              aria-label={`${l.label} ${meta.title}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onLight[l.action](meta.id)}
            />
          ))}
        </div>
        <h2 id={titleId} className="window__title">
          {meta.title}
        </h2>
      </header>

      <div className="window__body">
        <AppContent id={meta.id} />
      </div>
    </section>
  );
}

export const Window = memo(WindowImpl);

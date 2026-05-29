"use client";

import { useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

interface UseDragOptions {
  /** Element to translate while dragging (the move handle may be a child). */
  targetRef: RefObject<HTMLElement | null>;
  /** Called once on pointer-up with the total drag delta. */
  onCommit: (dx: number, dy: number) => void;
  /** Called on pointer-down, before dragging begins. */
  onStart?: () => void;
  disabled?: boolean;
}

interface UseDragResult {
  dragging: boolean;
  onPointerDown: (e: ReactPointerEvent) => void;
}

/**
 * Pointer-based drag. While dragging it writes a `translate3d` transform directly
 * to the target node on each move (compositor-friendly, and no React render per
 * pointer event); on release it clears the transform and reports the final delta
 * via `onCommit` so the caller can persist the new position. Drags that begin on
 * a <button> are ignored so window controls stay clickable.
 */
export function useDrag({
  targetRef,
  onCommit,
  onStart,
  disabled,
}: UseDragOptions): UseDragResult {
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (disabled || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const node = targetRef.current;
    if (!node) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const latest = { x: 0, y: 0 };
    const handle = e.currentTarget as HTMLElement;

    setDragging(true);
    onStart?.();
    handle.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      latest.x = ev.clientX - startX;
      latest.y = ev.clientY - startY;
      node.style.transform = `translate3d(${latest.x}px, ${latest.y}px, 0)`;
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      node.style.transform = "";
      setDragging(false);
      onCommit(latest.x, latest.y);
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  };

  return { dragging, onPointerDown };
}

"use client";

import { useEffect, useState } from "react";

type LineKind = "dim" | "ok" | "accent";

const LINES: { kind: LineKind; text: string }[] = [
  { kind: "dim", text: "portfolio.bios (c) hassan systems — power-on self test" },
  { kind: "ok", text: "CPU  ......... phosphor-core @ 4.77 MHz        [ OK ]" },
  { kind: "ok", text: "MEM  ......... 640K (it's enough)              [ OK ]" },
  { kind: "ok", text: "GPU  ......... CRT emulation layer             [ OK ]" },
  { kind: "ok", text: "FS   ......... mounting /portfolio             [ OK ]" },
  { kind: "ok", text: "NET  ......... resolving recruiters            [ OK ]" },
  { kind: "accent", text: "> launching hassan@portfolio …" },
];

const LINE_DELAY = 150;
const LINE_STEP = 200;
const SESSION_KEY = "ide-portfolio:booted";

export function BootScreen() {
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(0);
  const [fading, setFading] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let booted = false;
    try {
      booted = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (reduced || booted) {
      setDone(true);
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }

    setActive(true);
    const timers: number[] = [];
    LINES.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setVisible(i + 1), LINE_DELAY + i * LINE_STEP),
      );
    });
    const total = LINE_DELAY + LINES.length * LINE_STEP;
    timers.push(window.setTimeout(() => setFading(true), total + 300));
    timers.push(window.setTimeout(() => setDone(true), total + 850));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!active || done) return;
    const skip = () => setDone(true);
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [active, done]);

  if (done) return null;

  return (
    <div
      className="boot"
      data-fading={fading ? "true" : "false"}
      onClick={() => setDone(true)}
      role="status"
      aria-label="Booting portfolio"
    >
      <div className="boot__inner">
        {LINES.slice(0, visible).map((l, i) => (
          <div key={i} className="boot__line" data-kind={l.kind}>
            {l.text}
          </div>
        ))}
        <span className="boot__cursor" aria-hidden />
        <div className="boot__hint">click or press any key to skip</div>
      </div>
    </div>
  );
}

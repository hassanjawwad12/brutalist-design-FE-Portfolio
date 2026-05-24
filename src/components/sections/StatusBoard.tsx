"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

const STACK_ROTATION = [
  "Next.js · React · TypeScript",
  "Tailwind · GSAP · R3F",
  "Go · Postgres · Docker",
  "Framer · Vite · Linux",
];

const ROTATION_MS = 3200;

function formatPKT(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function StatusBoard() {
  const [time, setTime] = useState<string | null>(null);
  const [stackIdx, setStackIdx] = useState(0);
  const [stackVisible, setStackVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Live clock — only run client-side to avoid hydration mismatch
  useEffect(() => {
    setTime(formatPKT(new Date()));
    const id = window.setInterval(() => {
      setTime(formatPKT(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Stack rotation with fade
  useEffect(() => {
    const id = window.setInterval(() => {
      setStackVisible(false);
      window.setTimeout(() => {
        setStackIdx((i) => (i + 1) % STACK_ROTATION.length);
        setStackVisible(true);
      }, 220);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, []);

  // Cursor-tracked subtle glow inside panel
  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const handle = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      node.style.setProperty("--mx", `${x}%`);
      node.style.setProperty("--my", `${y}%`);
    };
    node.addEventListener("pointermove", handle);
    return () => node.removeEventListener("pointermove", handle);
  }, []);

  return (
    <div
      ref={panelRef}
      className="relative h-full w-full overflow-hidden border border-[color:var(--c-ink)] bg-[color:var(--c-concrete)] [--mx:50%] [--my:50%]"
      style={{
        backgroundImage:
          "radial-gradient(circle 160px at var(--mx) var(--my), rgba(228,255,58,0.18), transparent 70%)",
      }}
    >
      {/* corner ticks */}
      <span className="pointer-events-none absolute -top-px -left-px size-2 border-l-2 border-t-2 border-[color:var(--c-ink)]" />
      <span className="pointer-events-none absolute -top-px -right-px size-2 border-r-2 border-t-2 border-[color:var(--c-ink)]" />
      <span className="pointer-events-none absolute -bottom-px -left-px size-2 border-l-2 border-b-2 border-[color:var(--c-ink)]" />
      <span className="pointer-events-none absolute -bottom-px -right-px size-2 border-r-2 border-b-2 border-[color:var(--c-ink)]" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[color:var(--c-ink)] bg-[color:var(--c-ink)] text-[color:var(--c-concrete)]">
        <span className="mono text-[length:var(--text-2xs)] tracking-[0.28em]">
          STATUS · {time ? `${time} PKT` : "—— PKT"}
        </span>
        <span className="flex items-center gap-2 mono text-[length:var(--text-2xs)] tracking-[0.28em]">
          <span className="inline-block size-1.5 rounded-full bg-[color:var(--c-acid)] shadow-[0_0_0_3px_rgba(228,255,58,0.25)] animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5">
        {/* NOW */}
        <Block label="NOW WORKING ON">
          <p className="cursor-pointertext-[length:var(--text-sm)] leading-[1.5] text-[color:var(--c-ink)]">
            <span className="font-semibold">Frontend</span>
            <span className="text-[color:var(--c-ink-muted)]"> @ </span>
            <a
              href="https://www.ggi-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium cursor-pointer border-b border-[color:var(--c-ink)] hover:border-[color:var(--c-acid-deep)] hover:text-[color:var(--c-acid-deep)] transition-colors inline-flex items-baseline gap-1"
            >
              Golden Gate Innovations
              <span aria-hidden className="cursor-pointer text-[length:var(--text-2xs)]">↗</span>
            </a>
          </p>
          <p className="text-[length:var(--text-xs)] text-[color:var(--c-ink-muted)] mt-1">
            Scalable enterprise applications · High-throughput UI architecture · Cloud-sync ecosystems          </p>
        </Block>

        {/* STACK rotating */}
        <Block label="STACK · ROTATING">
          <div className="flex items-center gap-2 min-h-[1.4em]">
            <span className="text-[color:var(--c-acid-deep)] font-semibold">▸</span>
            <span
              className="text-[length:var(--text-sm)] transition-opacity duration-200"
              style={{ opacity: stackVisible ? 1 : 0 }}
            >
              {STACK_ROTATION[stackIdx]}
            </span>
          </div>
        </Block>

        {/* AVAILABILITY */}
        <Block label="AVAILABILITY">
          <div className="flex items-center justify-between">
            <span className="text-[length:var(--text-sm)] font-semibold">
              5–10 HRS / WK
            </span>
            <span className="flex items-center gap-2 mono text-[length:var(--text-2xs)] tracking-[0.28em]">
              <span className="inline-block size-1.5 rounded-full bg-[color:var(--c-acid-deep)]" />
              OPEN
            </span>
          </div>
        </Block>

        {/* Signature */}
        <div className="mt-1 pt-3 border-t border-[color:var(--c-rule-strong)] flex items-center justify-between">
          <span className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink)]">
            ◇ {profile.name.toUpperCase()}
          </span>
          <span className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink-muted)]">
            NO. 001
          </span>
        </div>
      </div>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="mono text-[length:var(--text-2xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)]">
          {label}
        </span>
        <span className="flex-1 h-px bg-[color:var(--c-rule)]" />
      </div>
      {children}
    </div>
  );
}

export default StatusBoard;

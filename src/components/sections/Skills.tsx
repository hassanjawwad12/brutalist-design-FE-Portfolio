"use client";

import dynamic from "next/dynamic";
import { skills } from "@/data/skills";
import { useInView } from "@/hooks/useInView";

const SkillsPhysics = dynamic(
  () => import("@/components/three/SkillsPhysics"),
  { ssr: false, loading: () => null }
);

export function Skills() {
  const [arenaRef, inView] = useInView<HTMLDivElement>({ rootMargin: "300px" });
  return (
    <section id="skills" className="border-b border-[color:var(--c-ink)]">
      <div className="mx-auto w-full max-w-[var(--max-w)] px-[var(--gutter)] pt-[var(--space-section)] pb-20">
        <header className="flex items-end justify-between gap-6 border-b border-[color:var(--c-ink)] pb-6">
          <div>
            <p className="mono text-[length:var(--text-xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-3">
              [ 03 — STACK ]
            </p>
            <h2 className="display text-[length:var(--text-3xl)] md:text-[length:var(--text-display)]">
              GRAB ONE.{" "}
              <span className="italic font-serif font-light">throw it.</span>
            </h2>
          </div>
          <p className="hidden md:block max-w-xs text-[length:var(--text-sm)] text-[color:var(--c-ink-soft)] text-right">
            The skills below are simulated rigid bodies — click and drag to
            fling them around. Yellow chips are backend, ink chips are
            frontend.
          </p>
        </header>

        {/* Physics arena */}
        <div
          ref={arenaRef}
          className="relative mt-10 aspect-[16/9] w-full border-2 border-[color:var(--c-ink)] bg-[color:var(--c-concrete-deep)] overflow-hidden"
        >
          {inView && <SkillsPhysics />}
          {/* Brutalist corner labels */}
          <span className="pointer-events-none absolute top-3 left-4 mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink)]">
            ↳ DRAG ME
          </span>
          <span className="pointer-events-none absolute top-3 right-4 mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink)]">
            REAL PHYSICS · RAPIER
          </span>
          <span className="pointer-events-none absolute bottom-3 left-4 mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink)]">
            {skills.length} ITEMS
          </span>
          <span className="pointer-events-none absolute bottom-3 right-4 mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink)]">
            ⬇ GRAVITY ON
          </span>
        </div>

        {/* Static legend for reduced-motion / accessibility */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["frontend", "backend", "data", "tooling"] as const).map((g) => {
            const list = skills.filter((s) => s.group === g);
            return (
              <div key={g}>
                <p className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink-muted)] pb-2 border-b border-[color:var(--c-rule-strong)] mb-3">
                  {g.toUpperCase()}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <li
                      key={s.id}
                      className="mono text-[length:var(--text-2xs)] tracking-[0.2em] px-2 py-1 border border-[color:var(--c-ink)]"
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

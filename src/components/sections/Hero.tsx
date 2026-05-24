"use client";

import dynamic from "next/dynamic";
import { profile } from "@/data/profile";

const StatusBoard = dynamic(
  () => import("@/components/sections/StatusBoard"),
  { ssr: false, loading: () => null }
);

export function Hero() {
  return (
    <section
      id="hero"
      className="relative border-b border-[color:var(--c-ink)] overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-[var(--max-w)] px-[var(--gutter)]">
        {/* Meta strip */}
        <div className="rule-b grid grid-cols-12 py-3 mono text-[length:var(--text-2xs)] tracking-[0.28em]">
          <span className="col-span-6 sm:col-span-3">[ 00 — INDEX ]</span>
          <span className="hidden sm:block col-span-6 text-center">
            {profile.location.toUpperCase()}
          </span>
          <span className="col-span-6 sm:col-span-3 text-right">
            {new Date()
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
        </div>

        {/* Hero content */}
        <div className="relative grid grid-cols-12 min-h-[78svh] gap-y-10 py-14 md:py-20">
          {/* Status board — desktop, sits in the right column with breathing room from the type */}
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-0 w-[34%] max-w-[400px] ml-12">
            <StatusBoard />
          </div>

          {/* Left col — display type */}
          <div className="relative z-10 col-span-12 md:col-span-7 flex flex-col justify-end pt-4 md:pt-0">
            <p className="mono text-[length:var(--text-xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-4">
              FRONTEND × GOLANG · ENGINEER
            </p>
            <h1 className="display text-[length:var(--text-mega)] leading-[0.84]">
              <span className="block">BUILDING</span>
              <span className="block">
                <span className="inline-block align-baseline pr-2 [text-shadow:0_2px_0_rgba(0,0,0,0.04)]">
                  REFRACTIVE
                </span>
              </span>
              <span className="block italic font-serif font-light">
                interfaces.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-[length:var(--text-lg)] leading-[1.4] text-[color:var(--c-ink-soft)]">
              {profile.tagline}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#work"
                className="group relative inline-flex items-center gap-3 bg-[color:var(--c-acid)] text-[color:var(--c-ink)] px-5 py-3 mono text-[length:var(--text-xs)] tracking-[0.24em] font-semibold border border-[color:var(--c-ink)] shadow-[3px_3px_0_0_var(--c-ink)] hover:bg-[color:var(--c-ink)] hover:text-[color:var(--c-acid)] hover:shadow-[5px_5px_0_0_var(--c-ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
              >
                SEE THE WORK
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-3 px-5 py-3 mono text-[length:var(--text-xs)] tracking-[0.24em] border border-[color:var(--c-ink)] hover:bg-[color:var(--c-ink)] hover:text-[color:var(--c-concrete)] transition-colors"
              >
                START A PROJECT
              </a>
            </div>
          </div>

          {/* Right col on desktop reserved for status board (absolute positioned).
              On mobile, render the status board inline below the buttons. */}
          <div className="md:hidden col-span-12">
            <StatusBoard />
          </div>

          {/* Right col — vertical meta only (desktop top-right) */}
          <div className="hidden md:flex relative z-10 col-span-12 md:col-span-5 md:flex-col md:items-end justify-start">
            <div className="flex flex-col items-end gap-1 mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink-muted)]">
              <span>{profile.shortName.toUpperCase()}.</span>
              <span>EST. 2023</span>
              <span>NO. 001</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

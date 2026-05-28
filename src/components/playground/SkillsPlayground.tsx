"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { skills } from "@/data/skills";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GROUP_META, GROUP_ORDER } from "./groups";
import type { ChipApi } from "./SkillsScene";

const makeApi = (): ChipApi => new Map();

const SkillsScene = dynamic(() => import("./SkillsScene"), {
  ssr: false,
  loading: () => (
    <div className="playground__loading">booting physics engine…</div>
  ),
});

function Legend() {
  return (
    <div className="playground__legend">
      {GROUP_ORDER.map((g) => (
        <span key={g} className="playground__legend-item">
          <span
            className="playground__swatch"
            style={{ background: GROUP_META[g].color }}
          />
          {GROUP_META[g].label}
        </span>
      ))}
    </div>
  );
}

/** Static, motion-free fallback: chips laid out by group. */
function FallbackGrid() {
  return (
    <div className="playground playground--static">
      <div className="playground__header">
        <h1># skills</h1>
        <p>
          A weighted map of what I reach for. (Interactive physics view disabled
          — reduced motion is on.)
        </p>
      </div>
      {GROUP_ORDER.map((g) => {
        const items = skills
          .filter((s) => s.group === g)
          .sort((a, b) => b.weight - a.weight);
        if (!items.length) return null;
        return (
          <section key={g} className="playground__group">
            <h2 style={{ color: GROUP_META[g].color }}>{GROUP_META[g].label}</h2>
            <div className="playground__chips">
              {items.map((s) => (
                <span
                  key={s.id}
                  className="playground__chip"
                  style={{
                    borderColor: GROUP_META[g].color,
                    color: GROUP_META[g].color,
                    fontSize: `${0.78 + s.weight * 0.08}rem`,
                  }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function SkillsPlayground() {
  const reduced = useReducedMotion();
  const apiRef = useRef<ChipApi>(makeApi());
  const [sceneKey, setSceneKey] = useState(0);

  if (reduced) return <FallbackGrid />;

  const shake = () => {
    apiRef.current?.forEach((body) => {
      body.applyImpulse(
        {
          x: (Math.random() - 0.5) * 6,
          y: 4 + Math.random() * 5,
          z: (Math.random() - 0.5) * 6,
        },
        true,
      );
      body.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8,
          z: (Math.random() - 0.5) * 0.8,
        },
        true,
      );
    });
  };

  const reset = () => setSceneKey((k) => k + 1);

  return (
    <div className="playground">
      <div className="playground__canvas">
        <SkillsScene key={sceneKey} apiRef={apiRef} />
      </div>

      <div className="playground__hud">
        <div className="playground__title">
          <span className="playground__title-main">skills.playground</span>
          <span className="playground__title-sub">
            click a chip to poke it · chip width = how often I reach for it
          </span>
        </div>
        <Legend />
        <div className="playground__controls">
          <button onClick={shake} title="Apply a random impulse to every chip">
            ⤜ shake
          </button>
          <button onClick={reset} title="Re-drop the chips">
            ↻ re-drop
          </button>
        </div>
      </div>
    </div>
  );
}

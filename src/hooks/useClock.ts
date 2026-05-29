"use client";

import { useEffect, useState } from "react";

/**
 * Live wall-clock string (HH:MM). Re-arms aligned to each minute boundary rather
 * than ticking every second — the rendered value only changes once a minute, so
 * a 1s interval would fire ~60 needless re-renders. Returns "" until mounted so
 * server and first client render match (no hydration mismatch from `Date`).
 */
export function useClock(): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
      timer = window.setTimeout(tick, 60000 - (now.getTime() % 60000));
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return time;
}

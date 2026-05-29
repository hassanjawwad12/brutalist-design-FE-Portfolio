"use client";

import { profile } from "@/data/profile";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";
import { useClock } from "@/hooks/useClock";

export function MenuBar() {
  const time = useClock();

  return (
    <header className="menubar glass" data-elevation="low" aria-label="Menu bar">
      <div className="menubar__left">
        <span className="menubar__logo" aria-hidden="true">
          {profile.shortName.charAt(0)}
        </span>
        <span className="menubar__name">{profile.shortName}</span>
        <span className="menubar__role">{profile.role}</span>
      </div>

      <div className="menubar__right">
        <AvailabilityDot status={profile.availability} />
        <kbd className="menubar__kbd" title="Command palette (Phase 4)">
          &#8984;K
        </kbd>
        <time className="menubar__clock" suppressHydrationWarning>
          {time}
        </time>
      </div>
    </header>
  );
}

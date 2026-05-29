// Phase 2 foundation checkpoint — wallpaper + glass primitives.
// Replaced in Phase 3 by the full <Desktop /> shell.
import { Wallpaper } from "@/components/desktop/Wallpaper";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";
import { profile } from "@/data/profile";

export default function Home() {
  return (
    <>
      <Wallpaper />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "var(--space-6)",
        }}
      >
        <GlassPanel
          tone="strong"
          elevation="floating"
          interactive
          style={{
            maxWidth: 440,
            width: "100%",
            padding: "var(--space-8)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-2xs)",
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: "var(--text-faint)",
              marginBottom: "var(--space-3)",
            }}
          >
            Liquid Glass · foundation
          </p>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-2)",
            }}
          >
            {profile.name}
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>
            {profile.role} · {profile.location}
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AvailabilityDot status={profile.availability} />
          </div>
        </GlassPanel>
      </main>
    </>
  );
}

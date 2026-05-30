import { ImageResponse } from "next/og";
import { profile, type Profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

const AVAIL_COLOR: Record<Profile["availability"], string> = {
  available: "#34c77b",
  selective: "#e0a020",
  closed: "#e0564a",
};

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif",
          backgroundColor: "#ece9f8",
          backgroundImage:
            "radial-gradient(at 16% 20%, #a78bfa 0px, transparent 50%), radial-gradient(at 84% 16%, #f9a8d4 0px, transparent 50%), radial-gradient(at 22% 86%, #7dd3fc 0px, transparent 50%), radial-gradient(at 88% 84%, #5eead4 0px, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            padding: "52px 60px",
            borderRadius: 32,
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 30px 80px rgba(42,30,78,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "#5b5570",
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 99,
                background: AVAIL_COLOR[profile.availability],
              }}
            />
            {profile.location}
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#241f33",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {profile.name}
          </div>
          <div style={{ fontSize: 40, color: "#6a4bd6" }}>{profile.role}</div>
          <div
            style={{
              fontSize: 27,
              color: "#5b5570",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 46,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 21,
            color: "#4a4560",
            letterSpacing: 2,
          }}
        >
          <span>{profile.socials[0]?.handle ?? profile.email}</span>
          <span>⌘K · liquid glass desktop</span>
        </div>
      </div>
    ),
    size,
  );
}

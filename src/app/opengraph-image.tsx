import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          color: "#33ff33",
          fontFamily: "monospace",
          padding: 64,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(51,255,51,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(51,255,51,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            background: "#050a05",
            borderBottom: "1px solid rgba(51,255,51,0.4)",
            display: "flex",
            alignItems: "center",
            paddingLeft: 24,
            gap: 12,
            fontSize: 20,
            color: "#0e8a0e",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              border: "1px solid #33ff33",
              boxShadow: "0 0 12px #33ff33",
              display: "flex",
            }}
          />
          {profile.shortName.toLowerCase()}@portfolio
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 90,
          }}
        >
          <span
            style={{
              fontSize: 26,
              color: "#0e8a0e",
              letterSpacing: 6,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            $ whoami
          </span>
          <span
            style={{
              fontSize: 88,
              color: "#7dff7d",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              textShadow: "0 0 24px rgba(51,255,51,0.45)",
            }}
          >
            {profile.name}
          </span>
          <span
            style={{
              fontSize: 38,
              color: "#ffb000",
              marginTop: 18,
              letterSpacing: 1,
              textShadow: "0 0 18px rgba(255,176,0,0.4)",
            }}
          >
            // {profile.role}
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#28c628",
              marginTop: 36,
              maxWidth: 1000,
              lineHeight: 1.4,
            }}
          >
            {profile.tagline}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 32,
            left: 64,
            right: 64,
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#0e8a0e",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span>type `help` to begin</span>
          <span>{profile.location}</span>
        </div>
      </div>
    ),
    size,
  );
}

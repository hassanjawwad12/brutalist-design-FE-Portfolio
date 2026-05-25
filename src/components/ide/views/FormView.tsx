"use client";

import { useEffect, useState } from "react";
import { useEditor } from "../store";
import { profile } from "@/data/profile";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--c-bg)",
  color: "var(--c-fg-bright)",
  padding: "var(--space-3)",
  border: "1px solid var(--c-border)",
  fontSize: "var(--text-sm)",
  fontFamily: "inherit",
};

export function FormView() {
  const { state, dispatch, showToast } = useEditor();
  const [submitting, setSubmitting] = useState(false);
  const { name, email, message, submittedAt } = state.contactForm;
  const dirty = !!(name || email || message) && !submittedAt;

  useEffect(() => {
    dispatch({ type: "MARK_DIRTY", path: "/contact.md", dirty });
  }, [dirty, dispatch]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const body = encodeURIComponent(
      `From: ${name} <${email}>\n\n${message}`,
    );
    const subject = encodeURIComponent(
      `Portfolio: hello from ${name || "a visitor"}`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    window.setTimeout(() => {
      setSubmitting(false);
      dispatch({ type: "CONTACT_SUBMIT" });
      showToast("opened your mail client →");
    }, 300);
  };

  return (
    <div
      style={{
        padding: "var(--space-8)",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      <h1
        className="md"
        style={{
          fontSize: "var(--text-3xl)",
          color: "var(--c-acid-bright)",
          textShadow: "var(--text-glow)",
          marginBottom: "var(--space-2)",
        }}
      >
        # contact
      </h1>
      <p
        style={{
          color: "var(--c-fg-soft)",
          marginBottom: "var(--space-6)",
          lineHeight: 1.6,
        }}
      >
        Fastest path: email{" "}
        <a
          href={`mailto:${profile.email}`}
          style={{ color: "var(--c-acid)", textShadow: "var(--text-glow)" }}
        >
          {profile.email}
        </a>
        . Or fill this out — it opens your mail client pre-addressed.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col" style={{ gap: 14 }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-2xs)",
              color: "var(--c-fg-muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) =>
              dispatch({
                type: "CONTACT_UPDATE",
                field: "name",
                value: e.target.value,
              })
            }
            style={fieldStyle}
            required
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-2xs)",
              color: "var(--c-fg-muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) =>
              dispatch({
                type: "CONTACT_UPDATE",
                field: "email",
                value: e.target.value,
              })
            }
            style={fieldStyle}
            required
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-2xs)",
              color: "var(--c-fg-muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            message
          </span>
          <textarea
            value={message}
            onChange={(e) =>
              dispatch({
                type: "CONTACT_UPDATE",
                field: "message",
                value: e.target.value,
              })
            }
            rows={6}
            style={{ ...fieldStyle, resize: "vertical" }}
            required
          />
        </label>
        <div className="flex items-center" style={{ gap: "var(--space-3)" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "var(--space-3) var(--space-6)",
              border: "1px solid var(--c-acid)",
              color: "var(--c-acid)",
              textShadow: "var(--text-glow)",
              boxShadow: "var(--glow-acid)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: "var(--text-xs)",
            }}
          >
            {submittedAt ? "sent ✓" : submitting ? "…" : "→ send"}
          </button>
          <span
            style={{
              color: "var(--c-fg-muted)",
              fontSize: "var(--text-xs)",
            }}
          >
            opens mailto: with the values pre-filled
          </span>
        </div>
      </form>
    </div>
  );
}

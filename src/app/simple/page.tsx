import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.role} (simple view)`,
  description: profile.tagline,
  robots: { index: true, follow: true },
};

const groups = ["frontend", "backend", "data", "tooling"] as const;

export default function SimplePage() {
  return (
    <div className="simple-page">
      <header>
        <p
          style={{
            fontSize: "var(--text-2xs)",
            color: "var(--text-faint)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "var(--space-2)",
          }}
        >
          plain semantic view ·{" "}
          <Link href="/">back to the desktop →</Link>
        </p>
        <h1>{profile.name}</h1>
        <p>
          <strong>{profile.role}</strong> · {profile.location}
        </p>
        <p>{profile.tagline}</p>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          {profile.socials.map((s) => (
            <span key={s.label}>
              {" · "}
              <a href={s.href} rel="noreferrer" target="_blank">
                {s.label}
              </a>
            </span>
          ))}
        </p>
      </header>

      <main>
        <section aria-labelledby="about-heading">
          <h2 id="about-heading">About</h2>
          <p>{profile.bio}</p>
        </section>

        <section aria-labelledby="experience-heading">
          <h2 id="experience-heading">Experience</h2>
          {experience.map((e) => (
            <article key={e.id}>
              <h3>
                {e.title}
                {e.org ? ` — ${e.org}` : ""}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-2)",
                }}
              >
                {e.period}
              </p>
              <p>{e.summary}</p>
              <ul>
                {e.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading">Selected work</h2>
          {projects.map((p) => (
            <article key={p.id}>
              <h3>
                {p.index} · {p.title}{" "}
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-faint)",
                    marginLeft: 8,
                  }}
                >
                  ({p.year} · {p.role})
                </span>
              </h3>
              <p>{p.description}</p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                }}
              >
                <strong style={{ color: "var(--text)" }}>Stack:</strong>{" "}
                {p.stack.join(" · ")}
              </p>
              <p>
                <a href={p.href} target="_blank" rel="noreferrer">
                  {p.href}
                </a>
                {p.repo ? (
                  <>
                    {" · "}
                    <a href={p.repo} target="_blank" rel="noreferrer">
                      repo
                    </a>
                  </>
                ) : null}
              </p>
            </article>
          ))}
        </section>

        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading">Skills</h2>
          {groups.map((g) => {
            const items = skills
              .filter((s) => s.group === g)
              .sort((a, b) => b.weight - a.weight);
            if (!items.length) return null;
            const label = g.charAt(0).toUpperCase() + g.slice(1);
            return (
              <p key={g}>
                <strong>{label}</strong> — {items.map((s) => s.label).join(", ")}
              </p>
            );
          })}
        </section>

        <section aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading">Testimonials</h2>
          {testimonials.map((t) => (
            <article key={t.id}>
              <p>“{t.quote}”</p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                }}
              >
                — <strong style={{ color: "var(--text)" }}>{t.author}</strong>, {t.role}
              </p>
            </article>
          ))}
        </section>

        <section aria-labelledby="resume-heading">
          <h2 id="resume-heading">Resume</h2>
          <p>
            <a href={profile.resumeHref} target="_blank" rel="noreferrer">
              Download resume (PDF) →
            </a>
          </p>
        </section>

        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading">Contact</h2>
          <p>
            Fastest path: <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </section>
      </main>

      <footer>
        <p>
          This is the plain semantic version of <Link href="/">the Liquid Glass desktop</Link>.
          No JavaScript required. Same content, no chrome.
        </p>
      </footer>
    </div>
  );
}

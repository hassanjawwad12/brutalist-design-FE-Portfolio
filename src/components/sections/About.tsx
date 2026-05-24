import { profile } from "@/data/profile";
import { experience } from "@/data/experience";

export function About() {
  return (
    <section
      id="about"
      className="relative border-b border-[color:var(--c-ink)] bg-[color:var(--c-concrete-deep)]"
    >
      <div className="mx-auto w-full max-w-[var(--max-w)] px-[var(--gutter)] pt-[var(--space-section)] pb-24 grid grid-cols-12 gap-y-12 gap-x-6">
        <header className="col-span-12 md:col-span-12 border-b border-[color:var(--c-ink)] pb-6 flex items-end justify-between">
          <div>
            <p className="mono text-[length:var(--text-xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-3">
              [ 02 — ABOUT ]
            </p>
            <h2 className="display text-[length:var(--text-3xl)] md:text-[length:var(--text-display)]">
              SHORT VERSION.
            </h2>
          </div>
          <p className="hidden md:block mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-ink-muted)]">
            {profile.name.toUpperCase()}
          </p>
        </header>

        {/* Editorial column */}
        <div className="col-span-12 md:col-span-7 relative">
          <p className="text-[length:var(--text-xl)] leading-[1.35] tracking-[-0.01em] max-w-[36rem]">
            {profile.bio}
          </p>

          <div className="mt-12 relative">
            {/* Floating glass shard in margin (CSS-only fake) */}
            <div
              aria-hidden
              className="hidden md:block absolute -left-20 top-2 size-14 rotate-[18deg] rounded-sm glass"
            />
            <p className="mono text-[length:var(--text-2xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-4">
              CURRENTLY
            </p>
            <ul className="space-y-3 text-[length:var(--text-base)]">
              <li className="flex items-baseline gap-3">
                <span className="text-[color:var(--c-ink)] font-semibold">→</span>
                Shipping Go services with quiet, fast HTTP layers.
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[color:var(--c-ink)] font-semibold">→</span>
                Designing motion + 3D systems for product surfaces.
              </li>
              <li className="flex items-baseline gap-3">
                <span className="text-[color:var(--c-ink)] font-semibold">→</span>
                Open to selective contract + product engineering work.
              </li>
            </ul>
          </div>
        </div>

        {/* Experience list */}
        <div className="col-span-12 md:col-span-5">
          <p className="mono text-[length:var(--text-2xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-5 pb-3 border-b border-[color:var(--c-rule-strong)]">
            EXPERIENCE
          </p>
          <ol className="space-y-7">
            {experience.map((e) => (
              <li
                key={e.id}
                className="grid grid-cols-12 gap-3 pb-6 border-b border-[color:var(--c-rule)]"
              >
                <span className="col-span-4 mono text-[length:var(--text-2xs)] tracking-[0.24em] text-[color:var(--c-ink-muted)] pt-1">
                  {e.period.toUpperCase()}
                </span>
                <div className="col-span-8">
                  <h3 className="text-[length:var(--text-lg)] font-semibold tracking-tight">
                    {e.title}
                    {e.org && (
                      <span className="text-[color:var(--c-ink-muted)] font-normal">
                        {" · "}
                        {e.orgHref ? (
                          <a
                            href={e.orgHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-b border-[color:var(--c-rule-strong)] hover:text-[color:var(--c-acid-deep)] hover:border-[color:var(--c-acid-deep)] transition-colors"
                          >
                            {e.org} ↗
                          </a>
                        ) : (
                          e.org
                        )}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-[length:var(--text-sm)] text-[color:var(--c-ink-soft)]">
                    {e.summary}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

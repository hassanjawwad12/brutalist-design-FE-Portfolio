import { projects } from "@/data/projects";

export function Work() {
  return (
    <section id="work" className="border-b border-[color:var(--c-ink)]">
      <div className="mx-auto w-full max-w-[var(--max-w)] px-[var(--gutter)] pt-[var(--space-section)] pb-20">
        <header className="flex items-end justify-between gap-6 border-b border-[color:var(--c-ink)] pb-6">
          <div>
            <p className="mono text-[length:var(--text-xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)] mb-3">
              [ 01 — SELECTED WORK ]
            </p>
            <h2 className="display text-[length:var(--text-3xl)] md:text-[length:var(--text-display)]">
              FOUR <span className="text-[color:var(--c-acid-deep)]">SHIPS</span>.
            </h2>
          </div>
          <p className="hidden md:block max-w-xs text-[length:var(--text-sm)] text-[color:var(--c-ink-soft)] text-right">
            A small set, picked for what they say about how I think — not how
            long the list is.
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-12 gap-6">
          {projects.map((p, i) => (
            <li
              key={p.id}
              className={[
                "relative col-span-12 md:col-span-6",
                i % 4 === 0 && "md:col-span-7",
                i % 4 === 1 && "md:col-span-5",
                i % 4 === 2 && "md:col-span-5",
                i % 4 === 3 && "md:col-span-7",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-full"
              >
                <article className="glass relative h-full p-7 md:p-9 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-4 mb-10">
                    <span className="mono text-[length:var(--text-2xs)] tracking-[0.32em] text-[color:var(--c-ink-muted)]">
                      {p.index} / {p.year}
                    </span>
                    <span
                      className={[
                        "mono text-[length:var(--text-2xs)] tracking-[0.28em] px-2 py-1 border",
                        p.status === "live"
                          ? "border-[color:var(--c-acid-deep)] bg-[color:var(--c-acid)]/40"
                          : "border-[color:var(--c-ink)] bg-transparent",
                      ].join(" ")}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="display text-[length:var(--text-3xl)] md:text-[length:var(--text-display)] leading-[0.9]">
                    {p.title}
                  </h3>

                  <p className="mt-6 max-w-md text-[length:var(--text-base)] text-[color:var(--c-ink-soft)]">
                    {p.description}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-[color:var(--c-rule)]">
                    <ul className="flex flex-wrap gap-2">
                      {p.stack.map((s) => (
                        <li
                          key={s}
                          className="mono text-[length:var(--text-2xs)] tracking-[0.2em] px-2 py-1 border border-[color:var(--c-rule-strong)]"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                    <span className="mono text-[length:var(--text-xs)] tracking-[0.24em] inline-flex items-center gap-2 group-hover:text-[color:var(--c-acid-deep)] transition-colors">
                      VISIT
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>

                  {/* corner ticks */}
                  <span className="absolute top-2 left-2 size-2 border-l border-t border-[color:var(--c-ink)]" />
                  <span className="absolute top-2 right-2 size-2 border-r border-t border-[color:var(--c-ink)]" />
                  <span className="absolute bottom-2 left-2 size-2 border-l border-b border-[color:var(--c-ink)]" />
                  <span className="absolute bottom-2 right-2 size-2 border-r border-b border-[color:var(--c-ink)]" />
                </article>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

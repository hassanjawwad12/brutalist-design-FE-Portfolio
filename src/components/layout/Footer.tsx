import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[color:var(--c-ink)] text-[color:var(--c-concrete)] border-t border-[color:var(--c-ink)] mt-[var(--space-section)]"
    >
      <div className="mx-auto w-full max-w-[var(--max-w)] px-[var(--gutter)] pt-20 pb-10">
        <div className="grid grid-cols-12 gap-y-12 gap-x-6">
          <div className="col-span-12 md:col-span-8">
            <p className="mono text-[length:var(--text-xs)] tracking-[0.32em] text-[color:var(--c-acid)] mb-6">
              [ 05 — CONTACT ]
            </p>
            <h2 className="display text-[length:var(--text-mega)]">
              GOT A&nbsp;
              <span className="text-[color:var(--c-acid)]">PROJECT</span>?
              <br />
              LET&apos;S TALK.
            </h2>
            <a
              href={`mailto:${profile.email}`}
              className="inline-block mt-10 mono text-[length:var(--text-base)] tracking-[0.12em] border-b border-[color:var(--c-acid)] pb-1 hover:text-[color:var(--c-acid)] transition-colors"
            >
              {profile.email} →
            </a>
          </div>

          <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
            <div>
              <p className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-concrete)]/60 mb-3">
                FIND ME ELSEWHERE
              </p>
              <ul className="flex flex-col gap-3">
                {profile.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between border-b border-[color:var(--c-concrete)]/15 pb-2 hover:border-[color:var(--c-acid)] transition-colors"
                    >
                      <span className="mono text-[length:var(--text-xs)] tracking-[0.24em]">
                        {s.label.toUpperCase()}
                      </span>
                      <span className="text-[color:var(--c-concrete)]/70 group-hover:text-[color:var(--c-acid)] transition-colors text-[length:var(--text-xs)]">
                        {s.handle} ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-concrete)]/60 mb-2">
                BASED IN
              </p>
              <p className="text-[length:var(--text-base)]">{profile.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-6 border-t border-[color:var(--c-concrete)]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-concrete)]/60">
            © {new Date().getFullYear()} — {profile.name.toUpperCase()}
          </p>
          <p className="mono text-[length:var(--text-2xs)] tracking-[0.28em] text-[color:var(--c-concrete)]/60">
            HAND-BUILT · NEXT 16 · R3F · RAPIER
          </p>
        </div>
      </div>
    </footer>
  );
}

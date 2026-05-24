import Link from "next/link";
import { profile } from "@/data/profile";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[color:var(--c-concrete)]/85 backdrop-blur-md border-b border-[color:var(--c-ink)]">
      <div className="mx-auto flex w-full max-w-[var(--max-w)] items-center justify-between px-[var(--gutter)] py-3">
        <Link
          href="/"
          className="mono text-[length:var(--text-xs)] tracking-[0.18em] text-[color:var(--c-ink)]"
        >
          {profile.shortName.toUpperCase()} / PORTFOLIO ’26
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mono text-[length:var(--text-xs)] tracking-[0.18em] text-[color:var(--c-ink)] hover:text-[color:var(--c-acid-deep)] transition-colors"
            >
              {item.label.toUpperCase()}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="hidden lg:flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-[color:var(--c-acid-deep)] shadow-[0_0_0_3px_rgba(228,255,58,0.25)]" />
            <span className="mono text-[length:var(--text-2xs)] tracking-[0.2em]">
              SELECTIVELY AVAILABLE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

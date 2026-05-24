const ITEMS = [
  "BRUTALIST × GLASS",
  "FRONTEND / GOLANG",
  "EST. 2023",
  "R3F · RAPIER · GSAP",
  "REMOTE — WORLDWIDE",
  "AVAILABLE Q3 ’26",
];

export function Ticker() {
  const sequence = [...ITEMS, ...ITEMS];
  return (
    <div className="border-y border-[color:var(--c-ink)] bg-[color:var(--c-ink)] text-[color:var(--c-concrete)] overflow-hidden">
      <div className="marquee-track flex gap-12 whitespace-nowrap py-3">
        {sequence.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="mono text-[length:var(--text-xs)] tracking-[0.32em] inline-flex items-center gap-12"
          >
            {label}
            <span aria-hidden className="text-[color:var(--c-acid)]">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

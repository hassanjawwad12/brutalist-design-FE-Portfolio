/**
 * Smoothly scroll a mobile-stack section into view (no-op on desktop, where the
 * stack is display:none and the element has no layout box). Honors reduced motion.
 */
export function scrollToSection(appId: string): void {
  const el = document.getElementById(`section-${appId}`);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

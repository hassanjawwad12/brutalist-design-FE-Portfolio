export type DiagnosticSeverity = "error" | "warn" | "info";

export interface Diagnostic {
  severity: DiagnosticSeverity;
  text: string;
  file: string;
}

// Tongue-in-cheek "Problems" panel — surfaced in both the Panel badge and the
// StatusBar counts so the two never drift.
export const diagnostics: Diagnostic[] = [
  {
    severity: "warn",
    text: "Side project debt at >2 (limit: 2). Consider closing some PRs.",
    file: "life.ts:12",
  },
  {
    severity: "info",
    text: "Coffee budget nearing daily threshold.",
    file: "habits.ts:3",
  },
  {
    severity: "info",
    text: "Untested hot take: 'CSS-in-JS is fine for small teams'.",
    file: "opinions.ts:42",
  },
];

export interface DiagnosticCounts {
  errors: number;
  warnings: number;
  infos: number;
  total: number;
}

export const diagnosticCounts = (): DiagnosticCounts => {
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warn").length;
  const infos = diagnostics.filter((d) => d.severity === "info").length;
  return { errors, warnings, infos, total: diagnostics.length };
};

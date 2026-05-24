export const THEMES = ["brutalist", "swiss", "editorial"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "brutalist";
export const THEME_STORAGE_KEY = "portfolio:theme";

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

// Inline script that runs before paint to avoid a flash of the default theme.
// Reads localStorage, validates, and sets <html data-theme="…">.
export const NO_FLASH_SCRIPT = `(() => {
  try {
    var k = ${JSON.stringify(THEME_STORAGE_KEY)};
    var allowed = ${JSON.stringify(THEMES)};
    var stored = localStorage.getItem(k);
    var theme = allowed.indexOf(stored) !== -1 ? stored : ${JSON.stringify(DEFAULT_THEME)};
    document.documentElement.setAttribute('data-theme', theme);
  } catch (_) {
    document.documentElement.setAttribute('data-theme', ${JSON.stringify(DEFAULT_THEME)});
  }
})();`;

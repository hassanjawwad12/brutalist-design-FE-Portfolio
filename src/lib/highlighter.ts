import type { Highlighter, ThemeRegistration } from "shiki";

/**
 * A custom Shiki theme that matches the portfolio's phosphor-green CRT palette
 * (mirrors the --syntax-* tokens in styles/tokens.css). Kept as a static object
 * so it can be registered once with the highlighter.
 */
const phosphorTheme: ThemeRegistration = {
  name: "phosphor",
  type: "dark",
  colors: {
    "editor.background": "#060d09",
    "editor.foreground": "#95d895",
  },
  settings: [
    { settings: { background: "#060d09", foreground: "#95d895" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#0e8a0e", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control"],
      settings: { foreground: "#ffb000" },
    },
    {
      scope: ["string", "string.quoted", "markup.inline.raw"],
      settings: { foreground: "#88ff88" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant"],
      settings: { foreground: "#ffd24d" },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: "#33ff33" },
    },
    {
      scope: ["entity.name.type", "support.type", "support.class"],
      settings: { foreground: "#ffb000" },
    },
    {
      scope: ["variable", "meta.definition.variable"],
      settings: { foreground: "#e0ffe0" },
    },
    {
      scope: ["punctuation", "meta.brace"],
      settings: { foreground: "#6fa86f" },
    },
    // markdown
    {
      scope: ["markup.heading", "entity.name.section.markdown"],
      settings: { foreground: "#88ff88", fontStyle: "bold" },
    },
    { scope: ["markup.bold"], settings: { foreground: "#88ff88", fontStyle: "bold" } },
    { scope: ["markup.italic"], settings: { foreground: "#ffb000", fontStyle: "italic" } },
    {
      scope: ["markup.underline.link", "string.other.link"],
      settings: { foreground: "#33ff33" },
    },
    { scope: ["markup.quote"], settings: { foreground: "#6fa86f", fontStyle: "italic" } },
    // json
    {
      scope: ["support.type.property-name.json", "meta.object-literal.key"],
      settings: { foreground: "#33ff33" },
    },
  ],
};

// Maps the FS node `language` field to a Shiki language id.
const LANG_MAP: Record<string, string> = {
  Markdown: "markdown",
  JSON: "json",
  Shell: "bash",
  TypeScript: "typescript",
  Image: "text",
  SVG: "text",
  URL: "text",
  PDF: "text",
  Plain: "text",
};

const LOADED_LANGS = ["markdown", "json", "bash"] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: [phosphorTheme],
        langs: [...LOADED_LANGS],
      }),
    );
  }
  return highlighterPromise;
};

const resolveLang = (language?: string): string => {
  const id = language ? LANG_MAP[language] ?? language.toLowerCase() : "text";
  return (LOADED_LANGS as readonly string[]).includes(id) ? id : "text";
};

/**
 * Highlight source to HTML using the phosphor theme. Falls back to a plain
 * (escaped) <pre> string if the grammar fails to load so the view never breaks.
 */
export const highlightToHtml = async (
  source: string,
  language?: string,
): Promise<string> => {
  const highlighter = await getHighlighter();
  const lang = resolveLang(language);
  return highlighter.codeToHtml(source, { lang, theme: "phosphor" });
};

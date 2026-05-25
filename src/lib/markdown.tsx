import { Fragment, type ReactNode } from "react";

const escape = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface InlineToken {
  type: "text" | "code" | "link" | "bold" | "italic";
  value: string;
  href?: string;
  children?: InlineToken[];
}

const parseInline = (src: string): InlineToken[] => {
  const tokens: InlineToken[] = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) {
      tokens.push({ type: "text", value: buf });
      buf = "";
    }
  };
  while (i < src.length) {
    const ch = src[i];

    // inline code
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // bold **
    if (ch === "*" && src[i + 1] === "*") {
      const end = src.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        tokens.push({
          type: "bold",
          value: "",
          children: parseInline(src.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    // italic *
    if (ch === "*") {
      const end = src.indexOf("*", i + 1);
      if (end !== -1 && src[i + 1] !== "*" && src[end - 1] !== "*") {
        flush();
        tokens.push({
          type: "italic",
          value: "",
          children: parseInline(src.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }

    // link [text](href)
    if (ch === "[") {
      const closeBracket = src.indexOf("]", i + 1);
      if (closeBracket !== -1 && src[closeBracket + 1] === "(") {
        const closeParen = src.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          flush();
          const text = src.slice(i + 1, closeBracket);
          const href = src.slice(closeBracket + 2, closeParen);
          tokens.push({
            type: "link",
            value: text,
            href,
            children: parseInline(text),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }

    buf += ch;
    i += 1;
  }
  flush();
  return tokens;
};

const renderInline = (tokens: InlineToken[], keyPrefix = ""): ReactNode => {
  return tokens.map((tok, i) => {
    const k = `${keyPrefix}-${i}`;
    if (tok.type === "text") return <Fragment key={k}>{tok.value}</Fragment>;
    if (tok.type === "code") return <code key={k}>{tok.value}</code>;
    if (tok.type === "bold")
      return <strong key={k}>{renderInline(tok.children ?? [], k)}</strong>;
    if (tok.type === "italic")
      return <em key={k}>{renderInline(tok.children ?? [], k)}</em>;
    if (tok.type === "link") {
      const isExternal = /^https?:\/\//.test(tok.href ?? "");
      const isMail = (tok.href ?? "").startsWith("mailto:");
      return (
        <a
          key={k}
          href={tok.href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer noopener" : undefined}
          data-internal={!isExternal && !isMail ? "true" : undefined}
        >
          {renderInline(tok.children ?? [], k)}
        </a>
      );
    }
    return null;
  });
};

export const renderMarkdown = (src: string): ReactNode => {
  const lines = src.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let listBuf: string[] = [];
  let orderedListBuf: string[] = [];
  let quoteBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listBuf.map((item, idx) => (
            <li key={idx}>{renderInline(parseInline(item))}</li>
          ))}
        </ul>,
      );
      listBuf = [];
    }
    if (orderedListBuf.length) {
      blocks.push(
        <ol key={`ol-${blocks.length}`}>
          {orderedListBuf.map((item, idx) => (
            <li key={idx}>{renderInline(parseInline(item))}</li>
          ))}
        </ol>,
      );
      orderedListBuf = [];
    }
  };

  const flushQuote = () => {
    if (quoteBuf.length) {
      blocks.push(
        <blockquote key={`bq-${blocks.length}`}>
          {quoteBuf.map((q, idx) => (
            <p key={idx}>{renderInline(parseInline(q))}</p>
          ))}
        </blockquote>,
      );
      quoteBuf = [];
    }
  };

  const flushAll = () => {
    flushList();
    flushQuote();
  };

  while (i < lines.length) {
    const line = lines[i];

    // code fence
    if (line.startsWith("```")) {
      flushAll();
      const lang = line.slice(3).trim();
      const start = i + 1;
      let end = start;
      while (end < lines.length && !lines[end].startsWith("```")) end += 1;
      const code = lines.slice(start, end).join("\n");
      blocks.push(
        <pre key={`pre-${blocks.length}`} data-lang={lang || undefined}>
          <code
            dangerouslySetInnerHTML={{ __html: highlightCode(code, lang) }}
          />
        </pre>,
      );
      i = end + 1;
      continue;
    }

    // blank line
    if (!line.trim()) {
      flushAll();
      i += 1;
      continue;
    }

    // hr
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushAll();
      blocks.push(<hr key={`hr-${blocks.length}`} />);
      i += 1;
      continue;
    }

    // headings
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const content = renderInline(parseInline(heading[2]));
      const tag = `h${Math.min(level, 4)}` as "h1" | "h2" | "h3" | "h4";
      const key = `h-${blocks.length}`;
      if (tag === "h1") blocks.push(<h1 key={key}>{content}</h1>);
      else if (tag === "h2") blocks.push(<h2 key={key}>{content}</h2>);
      else if (tag === "h3") blocks.push(<h3 key={key}>{content}</h3>);
      else blocks.push(<h4 key={key}>{content}</h4>);
      i += 1;
      continue;
    }

    // blockquote
    if (line.startsWith("> ")) {
      flushList();
      quoteBuf.push(line.slice(2));
      i += 1;
      continue;
    }
    if (line === ">") {
      flushList();
      quoteBuf.push("");
      i += 1;
      continue;
    }

    // unordered list
    const ul = /^[-*+]\s+(.*)$/.exec(line);
    if (ul) {
      flushQuote();
      listBuf.push(ul[1]);
      i += 1;
      continue;
    }

    // ordered list
    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushQuote();
      orderedListBuf.push(ol[1]);
      i += 1;
      continue;
    }

    // paragraph (collect consecutive lines)
    flushAll();
    const paraLines: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={`p-${blocks.length}`}>
        {renderInline(parseInline(paraLines.join(" ")))}
      </p>,
    );
  }

  flushAll();
  return blocks;
};

const TS_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "new",
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "class",
  "extends",
  "import",
  "from",
  "export",
  "default",
  "async",
  "await",
  "type",
  "interface",
  "enum",
  "as",
  "in",
  "of",
  "typeof",
]);

const SH_KEYWORDS = new Set([
  "if",
  "then",
  "else",
  "fi",
  "for",
  "do",
  "done",
  "while",
  "case",
  "esac",
  "function",
  "return",
  "export",
  "alias",
  "source",
  "eval",
]);

const highlightCode = (src: string, lang: string): string => {
  const isShell = /^(sh|bash|zsh|shell)$/i.test(lang);
  const keywords = isShell ? SH_KEYWORDS : TS_KEYWORDS;
  const escaped = escape(src);

  return escaped
    .replace(
      /(&quot;[^&]*?&quot;|'[^']*?')/g,
      `<span style="color:var(--syntax-string)">$1</span>`,
    )
    .replace(
      /(\/\/[^\n]*|#[^\n]*)/g,
      `<span style="color:var(--syntax-comment);font-style:italic">$1</span>`,
    )
    .replace(/\b(\d+)\b/g, `<span style="color:var(--syntax-number)">$1</span>`)
    .replace(/\b([a-zA-Z_$][\w$]*)\b/g, (m) => {
      if (keywords.has(m))
        return `<span style="color:var(--syntax-keyword)">${m}</span>`;
      return m;
    });
};

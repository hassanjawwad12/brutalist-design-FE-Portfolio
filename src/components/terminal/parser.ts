export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export const parseCommand = (input: string): ParsedCommand | null => {
  const raw = input.trim();
  if (!raw) return null;
  const tokens: string[] = [];
  let buf = "";
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (ch === " " && !inSingle && !inDouble) {
      if (buf) {
        tokens.push(buf);
        buf = "";
      }
      continue;
    }
    buf += ch;
  }
  if (buf) tokens.push(buf);
  if (tokens.length === 0) return null;
  return { name: tokens[0], args: tokens.slice(1), raw };
};

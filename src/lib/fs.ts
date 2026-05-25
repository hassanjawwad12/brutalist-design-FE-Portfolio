import { FS, type FsDir, type FsFile, type FsNode } from "@/data/fs";

export const normalizePath = (p: string): string => {
  if (!p) return "/";
  const collapsed = p.replace(/\/+/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
};

export const splitPath = (p: string): string[] => {
  const n = normalizePath(p);
  if (n === "/") return [];
  return n.slice(1).split("/");
};

export const joinPath = (parts: string[]): string => {
  if (parts.length === 0) return "/";
  return "/" + parts.join("/");
};

export const dirname = (p: string): string => {
  const parts = splitPath(p);
  if (parts.length <= 1) return "/";
  return joinPath(parts.slice(0, -1));
};

export const basename = (p: string): string => {
  const parts = splitPath(p);
  return parts[parts.length - 1] ?? "";
};

export const resolveNode = (path: string): FsNode | null => {
  const parts = splitPath(path);
  let node: FsNode = FS;
  for (const part of parts) {
    if (node.kind !== "dir") return null;
    const found: FsNode | undefined = node.children.find(
      (c) => c.name === part,
    );
    if (!found) return null;
    node = found;
  }
  return node;
};

export const isFile = (n: FsNode | null): n is FsFile =>
  !!n && n.kind === "file";
export const isDir = (n: FsNode | null): n is FsDir => !!n && n.kind === "dir";

export const resolvePath = (cwd: string, input: string): string => {
  if (!input) return cwd;
  let target: string[];
  if (input === "~" || input.startsWith("~/")) {
    target = ["~"].concat(input === "~" ? [] : input.slice(2).split("/"));
    target.shift();
  } else if (input.startsWith("/")) {
    target = input.slice(1).split("/").filter(Boolean);
  } else {
    target = splitPath(cwd).concat(input.split("/").filter(Boolean));
  }
  const stack: string[] = [];
  for (const part of target) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return joinPath(stack);
};

export const pathForDisplay = (p: string): string => {
  const n = normalizePath(p);
  if (n === "/") return "~";
  return "~" + n;
};

export interface ListEntry {
  name: string;
  kind: "dir" | "file";
  hidden: boolean;
  path: string;
}

export const listDir = (
  path: string,
  includeHidden = false,
): ListEntry[] | null => {
  const node = resolveNode(path);
  if (!isDir(node)) return null;
  const parent = normalizePath(path);
  return node.children
    .filter((c) => includeHidden || !c.hidden)
    .map((c) => ({
      name: c.name,
      kind: c.kind,
      hidden: !!c.hidden,
      path: parent === "/" ? `/${c.name}` : `${parent}/${c.name}`,
    }))
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
};

export interface FileEntry {
  path: string;
  name: string;
}

export const walkFiles = (
  node: FsNode = FS,
  prefix = "",
  includeHidden = false,
  acc: FileEntry[] = [],
): FileEntry[] => {
  const p = prefix === "" ? "/" : prefix;
  if (node.kind === "file") {
    acc.push({ path: p, name: node.name });
    return acc;
  }
  for (const child of node.children) {
    if (!includeHidden && child.hidden) continue;
    const childPath = p === "/" ? `/${child.name}` : `${p}/${child.name}`;
    walkFiles(child, childPath, includeHidden, acc);
  }
  return acc;
};

export const renderTree = (
  path: string,
  includeHidden = false,
  maxDepth = 4,
): string => {
  const node = resolveNode(path);
  if (!node) return "";
  if (node.kind === "file") return node.name;

  const lines: string[] = [];
  const root = basename(path) || "portfolio";
  lines.push(root);

  const walk = (dir: FsDir, prefix: string, depth: number) => {
    if (depth >= maxDepth) return;
    const visible = dir.children.filter((c) => includeHidden || !c.hidden);
    visible.forEach((child, i) => {
      const last = i === visible.length - 1;
      const branch = last ? "└── " : "├── ";
      lines.push(prefix + branch + child.name);
      if (child.kind === "dir") {
        walk(child, prefix + (last ? "    " : "│   "), depth + 1);
      }
    });
  };

  walk(node as FsDir, "", 0);
  return lines.join("\n");
};

export interface SearchHit {
  path: string;
  name: string;
  line: number;
  snippet: string;
}

export const grepFs = (
  pattern: string,
  root = "/",
  includeHidden = false,
): SearchHit[] => {
  const hits: SearchHit[] = [];
  const startNode = resolveNode(root);
  if (!startNode) return hits;
  const files = walkFiles(startNode, root, includeHidden);
  const lower = pattern.toLowerCase();
  for (const f of files) {
    const node = resolveNode(f.path);
    if (!isFile(node)) continue;
    if (node.view !== "markdown" && node.view !== "json") continue;
    const lines = node.source.split("\n");
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(lower)) {
        hits.push({
          path: f.path,
          name: f.name,
          line: idx + 1,
          snippet: line.trim().slice(0, 140),
        });
      }
    });
  }
  return hits;
};

export const completionsFor = (
  cwd: string,
  partial: string,
): string[] => {
  const lastSlash = partial.lastIndexOf("/");
  const dirInput = lastSlash >= 0 ? partial.slice(0, lastSlash) : "";
  const prefix = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial;
  const dirPath = resolvePath(cwd, dirInput);
  const entries = listDir(dirPath, true);
  if (!entries) return [];
  const matches = entries.filter((e) => e.name.startsWith(prefix));
  return matches.map((m) =>
    m.kind === "dir"
      ? (lastSlash >= 0 ? dirInput + "/" : "") + m.name + "/"
      : (lastSlash >= 0 ? dirInput + "/" : "") + m.name,
  );
};

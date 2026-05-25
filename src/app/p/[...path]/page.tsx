import type { Metadata } from "next";
import { IdePortfolio } from "@/components/ide/IdePortfolio";
import { FS, type FsNode } from "@/data/fs";
import { profile } from "@/data/profile";
import { resolveNode, walkFiles } from "@/lib/fs";

interface PageProps {
  params: Promise<{ path: string[] }>;
}

const joinSlugs = (slugs: string[]): string => "/" + slugs.join("/");

const firstMarkdownHeading = (src: string): string | null => {
  const lines = src.split("\n");
  for (const line of lines) {
    const m = /^#{1,3}\s+(.+)$/.exec(line.trim());
    if (m) return m[1].trim();
  }
  return null;
};

const firstParagraph = (src: string): string | null => {
  const lines = src.split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith(">")) continue;
    if (t.startsWith("```")) continue;
    if (t.startsWith("-") || /^\d+\./.test(t)) continue;
    return t.slice(0, 220);
  }
  return null;
};

export async function generateStaticParams() {
  const all = walkFiles(FS as FsNode, "", true);
  return all.map((f) => ({
    path: f.path.replace(/^\//, "").split("/"),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { path } = await params;
  const filePath = joinSlugs(path);
  const node = resolveNode(filePath);

  if (!node || node.kind !== "file") {
    return {
      title: `404 — ${filePath} · ${profile.shortName}@portfolio`,
      description: `No such file in this portfolio: ${filePath}`,
    };
  }

  const inferredTitle =
    node.view === "markdown" || node.view === "form" || node.view === "pdf"
      ? firstMarkdownHeading(node.source)
      : null;
  const title = `${inferredTitle ?? node.name} · ${profile.shortName}@portfolio`;
  const description =
    node.view === "markdown" || node.view === "form" || node.view === "pdf"
      ? firstParagraph(node.source) ?? profile.tagline
      : `${node.name} — open in the ${profile.shortName} portfolio IDE.`;

  const ogPath = `/p${filePath}`;

  return {
    title,
    description,
    alternates: { canonical: ogPath },
    openGraph: {
      title,
      description,
      url: ogPath,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function FilePage({ params }: PageProps) {
  const { path } = await params;
  const filePath = joinSlugs(path);
  return <IdePortfolio initialPath={filePath} />;
}

export const dynamicParams = false;

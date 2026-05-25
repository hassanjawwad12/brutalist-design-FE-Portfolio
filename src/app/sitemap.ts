import type { MetadataRoute } from "next";
import { FS } from "@/data/fs";
import { walkFiles } from "@/lib/fs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const files = walkFiles(FS, "", true);

  const fileRoutes = files.map((f) => ({
    url: `${SITE_URL}/p${f.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/simple`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...fileRoutes,
  ];
}

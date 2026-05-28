import type { Skill } from "@/data/skills";

export type SkillGroup = Skill["group"];

interface GroupMeta {
  label: string;
  color: string;
}

// On-brand palette derived from the phosphor/amber tokens — four groups mapped
// across the two hues so they stay distinguishable without leaving the theme.
export const GROUP_META: Record<SkillGroup, GroupMeta> = {
  frontend: { label: "Frontend", color: "#33ff33" },
  backend: { label: "Backend", color: "#ffb000" },
  data: { label: "Data", color: "#88ff88" },
  tooling: { label: "Tooling", color: "#c78800" },
};

export const GROUP_ORDER: SkillGroup[] = [
  "frontend",
  "backend",
  "data",
  "tooling",
];

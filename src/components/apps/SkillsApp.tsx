import { skills, skillGroups } from "@/data/skills";

export function SkillsApp() {
  return (
    <div className="app skills">
      {skillGroups.map((g) => {
        const items = skills
          .filter((s) => s.group === g.key)
          .sort((a, b) => b.weight - a.weight);
        if (items.length === 0) return null;
        return (
          <section key={g.key} className="skills__group">
            <h3 className="app__eyebrow">{g.label}</h3>
            <div className="skills__chips">
              {items.map((s) => (
                <span key={s.id} className="skill-chip" data-weight={s.weight}>
                  {s.label}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

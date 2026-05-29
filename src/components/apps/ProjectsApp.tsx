import Image from "next/image";
import { projects } from "@/data/projects";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function ProjectsApp() {
  return (
    <div className="app projects">
      {projects.map((p, i) => (
        <article
          key={p.id}
          className="project"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {p.image && (
            <div className="project__media">
              <Image
                src={p.image}
                alt={`${p.title} screenshot`}
                fill
                sizes="(max-width: 640px) 90vw, 520px"
                className="project__img"
              />
            </div>
          )}
          <div className="project__body">
            <div className="project__top">
              <span className="project__index">{p.index}</span>
              <span className="project__status" data-status={p.status}>
                {p.status}
              </span>
            </div>
            <h3 className="project__title">{p.title}</h3>
            <p className="project__meta">
              {p.role} · {p.year}
            </p>
            <p className="project__desc">{p.description}</p>
            <ul className="project__stack">
              {p.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div className="project__links">
              <ExternalLink href={p.href} className="project__link">
                Visit ↗
              </ExternalLink>
              {p.repo && (
                <ExternalLink href={p.repo} className="project__link">
                  Repo ↗
                </ExternalLink>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

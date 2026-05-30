import { experience } from "@/data/experience";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function ExperienceApp() {
  return (
    <div className="app exp">
      <ol className="exp__list">
        {experience.map((e) => (
          <li key={e.id} className="exp__item">
            <span className="exp__dot" aria-hidden="true" />
            <div className="exp__content">
              <p className="exp__period">{e.period}</p>
              <h3 className="exp__title">
                {e.title}
                {e.org && (
                  <>
                    {" · "}
                    {e.orgHref ? (
                      <ExternalLink href={e.orgHref} className="exp__org">
                        {e.org}
                      </ExternalLink>
                    ) : (
                      <span className="exp__org">{e.org}</span>
                    )}
                  </>
                )}
              </h3>
              <p className="exp__summary">{e.summary}</p>
              <ul className="exp__highlights">
                {e.highlights.map((h, i) => (
                  <li key={`${e.id}-${i}`}>{h}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

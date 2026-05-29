import { profile } from "@/data/profile";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function ContactApp() {
  return (
    <div className="app contact">
      <p className="app__eyebrow">Get in touch</p>
      <h3 className="contact__head">Let&rsquo;s build something.</h3>
      <AvailabilityDot status={profile.availability} />

      <a href={`mailto:${profile.email}`} className="contact__email">
        {profile.email}
      </a>

      <div className="contact__links">
        {profile.socials.map((s) => (
          <ExternalLink key={s.label} href={s.href} className="contact__link">
            {s.label} ↗
          </ExternalLink>
        ))}
        <ExternalLink href={profile.resumeHref} className="contact__link">
          Résumé ↗
        </ExternalLink>
      </div>
    </div>
  );
}

import Image from "next/image";
import { profile } from "@/data/profile";
import { AvailabilityDot } from "@/components/ui/AvailabilityDot";
import { ExternalLink } from "@/components/ui/ExternalLink";

export function AboutApp() {
  return (
    <div className="app about">
      <div className="about__head">
        <Image
          src="/hassan-pic.png"
          alt={profile.name}
          width={60}
          height={60}
          className="about__avatar"
        />
        <div className="about__heading">
          <p className="app__eyebrow">{profile.location}</p>
          <h3 className="about__name">{profile.name}</h3>
          <p className="about__role">{profile.role}</p>
        </div>
      </div>

      <p className="about__tagline">{profile.tagline}</p>
      <p className="about__bio">{profile.bio}</p>

      <AvailabilityDot status={profile.availability} />

      <div className="about__socials">
        {profile.socials.map((s) => (
          <ExternalLink key={s.label} href={s.href} className="about__social">
            <span className="about__social-label">{s.label}</span>
            <span className="about__social-handle">{s.handle}</span>
          </ExternalLink>
        ))}
      </div>
    </div>
  );
}

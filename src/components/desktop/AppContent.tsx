import "../apps/apps.css";
import type { AppId } from "./apps";
import { AboutApp } from "@/components/apps/AboutApp";
import { ProjectsApp } from "@/components/apps/ProjectsApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { SkillsApp } from "@/components/apps/SkillsApp";
import { GithubApp } from "@/components/apps/GithubApp";
import { TestimonialsApp } from "@/components/apps/TestimonialsApp";
import { ContactApp } from "@/components/apps/ContactApp";

/** Resolves a window's body component by app id. */
export function AppContent({ id }: { id: AppId }) {
  switch (id) {
    case "about":
      return <AboutApp />;
    case "projects":
      return <ProjectsApp />;
    case "experience":
      return <ExperienceApp />;
    case "skills":
      return <SkillsApp />;
    case "github":
      return <GithubApp />;
    case "testimonials":
      return <TestimonialsApp />;
    case "contact":
      return <ContactApp />;
  }
}

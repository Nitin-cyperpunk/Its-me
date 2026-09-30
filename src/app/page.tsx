import Faq from "@/components/faq/Faq";
import Hero from "@/components/portfolio/Hero/Hero";
import CinematicFooter from "@/components/footer/CinematicFooter";
import Preloader from "@/components/preloader/Preloader";
import AboutSection from "@/components/sections/AboutSection";
import BeyondCodeSection from "@/components/sections/BeyondCodeSection";
import EducationSection from "@/components/sections/EducationSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import GithubActivitySection from "@/components/sections/GithubActivitySection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import Scenes from "@/components/sections/Scenes";
import SkillsSection from "@/components/sections/SkillsSection";

export default function Home() {
  return <>
  {/* the terminal intro: a fixed overlay, gone once the page is revealed */}
  <Preloader />
  <main className="flex flex-1 flex-col text-white">
    <Hero />
    {/* one scene per viewport, sharing the NITINVERSE design system */}
    <Scenes>
      <AboutSection />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <GithubActivitySection />
      <BeyondCodeSection />
      {/* the footer that follows carries the contact call to action */}
      <Faq />
    </Scenes>
  </main>
  <CinematicFooter />
  </>;
}

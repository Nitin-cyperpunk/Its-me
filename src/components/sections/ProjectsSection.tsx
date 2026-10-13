import { projects } from "@/content/portfolio";
import { getProjects } from "@/lib/content";
import FloatingObject from "@/components/ui/FloatingObject";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import ProjectSequence from "./ProjectSequence";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./projects.module.css";

// Projects come from the database (lib/content.ts); the heading stays here.
export default async function ProjectsSection() {
  const items = await getProjects();
  return (
    <Scene id="projects" labelledBy="projects-title" className={styles.projects} exit={false}>
      <FloatingObject shape="sphere" className={styles.sphere} from="right" depth={0.6} float={14} desktopOnly />
      <FloatingObject shape="ring" className={styles.ring} from="bottom" depth={0.4} float={8} />

      <div className={s.content}>
        <SectionLabel index="04">Projects</SectionLabel>
        <SplitHeading id="projects-title" lines={projects.heading} className={styles.title} />
        <ProjectSequence items={items} />
      </div>
    </Scene>
  );
}

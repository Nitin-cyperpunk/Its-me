import { experience } from "@/content/portfolio";
import FloatingObject from "@/components/ui/FloatingObject";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import ExperienceStack from "./ExperienceStack";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./experience.module.css";

export default function ExperienceSection() {
  return (
    <Scene id="experience" labelledBy="experience-title" className={styles.experience} exit={false}>
      {/* Education's ribbon, now lying behind the stack */}
      <FloatingObject shape="ribbon" className={styles.ribbon} from="top" depth={0.3} float={4} />
      <FloatingObject shape="sphere" className={styles.sphere} from="left" depth={0.8} float={12} desktopOnly />

      <div className={`${s.content} ${styles.layout}`}>
        <div>
          <SectionLabel index="03">Experience</SectionLabel>
          <SplitHeading id="experience-title" lines={experience.heading} />
          <p className={s.copy} data-reveal="copy">
            {experience.intro}
          </p>
        </div>

        <ExperienceStack roles={experience.roles} />
      </div>
    </Scene>
  );
}

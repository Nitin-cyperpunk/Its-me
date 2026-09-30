import { skills } from "@/content/portfolio";
import FloatingObject from "@/components/ui/FloatingObject";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import SkillConstellation from "./SkillConstellation";
import s from "./scenes.module.css";
import styles from "./skills.module.css";

export default function SkillsSection() {
  return (
    <Scene id="skills" labelledBy="skills-title" className={styles.skills}>
      <FloatingObject shape="sphere" className={styles.sphere} from="left" depth={0.5} float={10} desktopOnly />

      <div className={`${s.content} ${styles.layout}`} data-scene-content>
        <div>
          <SectionLabel index="05">Skills</SectionLabel>
          <SplitHeading id="skills-title" lines={skills.heading} className={styles.title} />
        </div>
        <SkillConstellation items={skills.items} />
      </div>
    </Scene>
  );
}

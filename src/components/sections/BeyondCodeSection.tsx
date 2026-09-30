import { beyondCode } from "@/content/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import InterestField from "./InterestField";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./beyond.module.css";

export default function BeyondCodeSection() {
  return (
    <Scene id="beyond-code" labelledBy="beyond-title" className={styles.beyond}>
      <div className={s.content} data-scene-content>
        <SectionLabel index="07">Beyond code</SectionLabel>
        <SplitHeading id="beyond-title" lines={beyondCode.heading} className={styles.title} />
      </div>
      <InterestField items={beyondCode.interests} />
    </Scene>
  );
}

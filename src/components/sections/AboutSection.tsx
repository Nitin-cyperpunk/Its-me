import { about } from "@/content/portfolio";
import FloatingObject from "@/components/ui/FloatingObject";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./about.module.css";

export default function AboutSection() {
  return (
    <Scene id="about" labelledBy="about-title" className={styles.about}>
      {/* picks up the hero's cream desk so the handover isn't a hard edge */}
      <div className={styles.fromHero} aria-hidden="true" />

      <FloatingObject shape="sphere" className={styles.sphere} from="right" depth={0.7} float={16} />
      <FloatingObject shape="ring" className={styles.ring} from="left" depth={0.3} float={10} desktopOnly />
      <FloatingObject shape="pill" className={styles.pill} from="right" depth={0.9} float={8} desktopOnly />
      <FloatingObject shape="sphere" className={styles.dot} from="bottom" depth={1.1} float={6} />

      <div className={`${s.content} ${styles.layout}`} data-scene-content>
        <div>
          <SectionLabel index="01">About</SectionLabel>
          <SplitHeading id="about-title" lines={about.heading} />
        </div>

        <div className={styles.aside}>
          <blockquote className={styles.statement} data-reveal="copy">
            “{about.statement}”
          </blockquote>
          <ul className={styles.focus} aria-label="Focus areas">
            {about.focus.map((area) => (
              <li key={area} className={s.chip} data-reveal="item">
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Scene>
  );
}

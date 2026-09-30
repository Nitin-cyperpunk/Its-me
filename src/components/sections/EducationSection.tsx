import { education } from "@/content/portfolio";
import FloatingObject from "@/components/ui/FloatingObject";
import GlassCard from "@/components/ui/GlassCard";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./education.module.css";

export default function EducationSection() {
  return (
    <Scene id="education" labelledBy="education-title" className={styles.education}>
      {/* the degree as a huge outlined mark behind everything */}
      <p className={styles.mark} aria-hidden="true" data-depth="0.25">
        B.E.
      </p>

      {/* enters from the right, where About's sphere left */}
      <FloatingObject shape="prism" className={styles.prism} from="right" depth={0.8} float={14} />
      <FloatingObject shape="ribbon" className={styles.ribbon} from="left" depth={0.5} float={6} desktopOnly />

      <div className={`${s.content} ${styles.layout}`} data-scene-content>
        <div>
          <SectionLabel index="02">Education</SectionLabel>
          <SplitHeading id="education-title" lines={education.heading} />
        </div>

        <div className={styles.stage}>
          <GlassCard as="article" tone="blue" className={styles.card} data-reveal="item">
            <p className={s.soon}>Degree</p>
            <h3 className={styles.degree}>{education.degree}</h3>
            <p className={styles.honors}>{education.honors}</p>
            <p className={styles.institution}>
              {education.institution}, {education.city}
            </p>
            <p className={`${styles.years} ${s.mono}`}>{education.years}</p>
          </GlassCard>

          {/* floating metadata around the card */}
          <span className={`${s.chip} ${styles.metaYears}`} data-reveal="item">
            {education.years}
          </span>
          <span className={`${s.chip} ${styles.metaCity}`} data-reveal="item">
            {education.city}
          </span>
          <span className={`${s.chip} ${styles.metaHonors}`} data-reveal="item">
            Honors · Cybersecurity
          </span>
        </div>
      </div>
    </Scene>
  );
}

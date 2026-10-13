import { education } from "@/content/portfolio";
import { getEducation } from "@/lib/content";
import FloatingObject from "@/components/ui/FloatingObject";
import GlassCard from "@/components/ui/GlassCard";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./education.module.css";

// Entries come from the database (lib/content.ts): the first published one is
// the headline card, any others (e.g. 12th) are listed under it.
export default async function EducationSection() {
  const [main, ...others] = await getEducation();
  const place = [main.institution, main.city].filter(Boolean).join(", ");
  const honorsChip = main.honors && `Honors · ${main.honors.replace(/\s*honou?rs\s*/i, " ").trim()}`;
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
            <h3 className={styles.degree}>{main.qualification}</h3>
            {main.honors && <p className={styles.honors}>{main.honors}</p>}
            {place && <p className={styles.institution}>{place}</p>}
            {(main.years || main.grade) && (
              <p className={`${styles.years} ${s.mono}`}>{[main.years, main.grade].filter(Boolean).join(" · ")}</p>
            )}
            {others.length > 0 && (
              <ul className={styles.others}>
                {others.map((entry) => (
                  <li key={entry.qualification}>
                    <span className={styles.otherTitle}>{entry.qualification}</span>
                    <span className={s.soon}>
                      {[entry.institution, entry.city, entry.years, entry.grade].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          {/* floating metadata around the card */}
          {main.years && (
            <span className={`${s.chip} ${styles.metaYears}`} data-reveal="item">
              {main.years}
            </span>
          )}
          {main.city && (
            <span className={`${s.chip} ${styles.metaCity}`} data-reveal="item">
              {main.city}
            </span>
          )}
          {honorsChip && (
            <span className={`${s.chip} ${styles.metaHonors}`} data-reveal="item">
              {honorsChip}
            </span>
          )}
        </div>
      </div>
    </Scene>
  );
}

import { Fragment } from "react";
import { heroText } from "./hero-assets";
import HeroControls from "./HeroControls";
import styles from "./hero.module.css";

// data-hero-name / data-hero-fade are the hooks the entrance animates,
// data-hero-text is what rises as the hero scrolls away — keep them.
export default function HeroText() {
  return (
    <div className={styles.text} data-hero-text>
      <h1 className={styles.name} data-hero-name data-enter>
        {heroText.name}
      </h1>
      {/* a quick pen stroke under the signature */}
      <svg
        className={styles.underline}
        viewBox="0 0 300 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden="true"
        data-hero-fade
        data-enter
      >
        <path d="M4 9C42 3 88 12 138 6s110 5 158-1" />
      </svg>

      <p className={styles.role} data-hero-fade data-enter>
        {heroText.role}
      </p>

      <p className={styles.tagline} data-hero-fade data-enter>
        {heroText.tagline.map((word, i) => (
          <Fragment key={word}>
            {i > 0 && <span aria-hidden="true">·</span>}
            {word}
          </Fragment>
        ))}
      </p>

      <p className={styles.intro} data-hero-fade data-enter>
        {heroText.intro}
      </p>

      <HeroControls />
    </div>
  );
}

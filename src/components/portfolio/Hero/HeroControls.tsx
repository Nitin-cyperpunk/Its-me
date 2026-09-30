import { heroText } from "./hero-assets";
import { DEFAULT_MODE, heroModes } from "./hero-modes";
import styles from "./hero.module.css";

// The four keys that rearrange the desk. Server-rendered: useHeroAnimations
// listens for clicks on [data-mode] and moves aria-pressed along with the
// arrangement, so no React state is involved.
export default function HeroControls() {
  return (
    <div
      className={styles.controls}
      role="group"
      aria-label="Rearrange the desk"
      data-hero-controls
    >
      {heroModes.map((mode) => (
        // the wrapper takes the entrance animation so the key's own
        // hover/pressed transform stays free
        <span key={mode.id} data-hero-control data-enter>
          <button
            type="button"
            className={styles.control}
            data-mode={mode.id}
            data-label={mode.label}
            aria-label={mode.label}
            aria-pressed={mode.id === DEFAULT_MODE}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={mode.icon} />
            </svg>
          </button>
        </span>
      ))}

      <span className={styles.controlsNote} data-hero-decor data-enter aria-hidden="true">
        <svg viewBox="0 0 52 34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M48 30C34 32 14 26 7 6" />
          <path d="M3 16L6.5 4 17 11" />
        </svg>
        <span>{heroText.controlsNote}</span>
      </span>
    </div>
  );
}

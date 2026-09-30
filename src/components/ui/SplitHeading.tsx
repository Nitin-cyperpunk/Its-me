import { Fragment } from "react";
import styles from "@/components/sections/scenes.module.css";

// A scene heading, one entry per line, split into masked words the shared
// reveal can lift into place. Reads as normal text to assistive tech.
export default function SplitHeading({
  id,
  lines,
  className = "",
}: {
  id: string;
  lines: string[];
  className?: string;
}) {
  return (
    <h2 id={id} className={`${styles.heading} ${className}`}>
      {lines.map((line) => {
        const words = line.split(" ");
        return (
          <span key={line} className={styles.headingLine}>
            {words.map((word, i) => (
              <Fragment key={i}>
                <span className={styles.mask}>
                  <span className={styles.word} data-word>
                    {word}
                  </span>
                </span>
                {/* the space sits outside the mask so it's never clipped */}
                {i < words.length - 1 && " "}
              </Fragment>
            ))}
          </span>
        );
      })}
    </h2>
  );
}

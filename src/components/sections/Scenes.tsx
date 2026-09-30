import type { ReactNode } from "react";
import ScrollRefresh from "./ScrollRefresh";
import styles from "./scenes.module.css";

// Everything between the hero and the footer lives in here: one scope for the
// NITINVERSE design tokens (light / dark via html[data-theme], like the rest of
// the site), shared by every scene and by the FAQ's restyle. Fonts come from
// the site's type system (globals.css).
export default function Scenes({ children }: { children: ReactNode }) {
  return (
    <div className={styles.universe}>
      {children}
      <ScrollRefresh />
    </div>
  );
}

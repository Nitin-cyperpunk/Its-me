import type { ReactNode } from "react";
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import ScrollRefresh from "./ScrollRefresh";
import styles from "./scenes.module.css";

// Same faces the rest of the site already loads (FAQ body, hero/terminal mono),
// so no new font files are downloaded.
const body = Host_Grotesk({
  subsets: ["latin"],
  variable: "--nv-font-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--nv-font-mono",
});

// Everything between the hero and the footer lives in here: one scope for the
// NITINVERSE design tokens (light / dark via prefers-color-scheme, like the
// rest of the site), shared by every scene and by the FAQ's restyle.
export default function Scenes({ children }: { children: ReactNode }) {
  return (
    <div className={`${body.variable} ${mono.variable} ${styles.universe}`}>
      {children}
      <ScrollRefresh />
    </div>
  );
}

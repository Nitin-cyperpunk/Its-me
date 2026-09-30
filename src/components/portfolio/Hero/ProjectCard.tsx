import type { CSSProperties, ReactNode } from "react";
import type { ProjectAsset } from "./hero-assets";
import styles from "./hero.module.css";

// A project as a piece of paper on the desk: a ticket, a printed card, a
// browser window, a workflow, a sticky note. It becomes a link once
// projectLink is set in hero-assets.ts.
export default function ProjectCard({
  project,
  className,
  style,
  children,
}: {
  project: ProjectAsset;
  className: string;
  style: CSSProperties;
  children?: ReactNode;
}) {
  const cardClass = `${className} ${styles.card} ${styles[project.variant]}`;
  const body = (
    <>
      {project.variant === "browser" && (
        <span className={styles.chrome} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
      <span className={styles.cardBody}>
        <span className={styles.cardLabel}>{project.label}</span>
        <span className={styles.cardTitle}>{project.title}</span>
        <span className={styles.cardDesc}>{project.description}</span>
        {project.variant === "browser" && (
          <span className={styles.fields} aria-hidden="true">
            <i />
            <i />
          </span>
        )}
        {project.variant === "workflow" && (
          <span className={styles.nodes} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
      {children}
    </>
  );

  if (!project.projectLink) {
    return (
      <div className={cardClass} style={style}>
        {body}
      </div>
    );
  }

  return (
    <a href={project.projectLink} draggable={false} className={cardClass} style={style}>
      {body}
    </a>
  );
}

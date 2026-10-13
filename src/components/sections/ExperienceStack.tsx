"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Experience } from "@/content/portfolio";
import { gsap, type Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
import s from "./scenes.module.css";
import styles from "./experience.module.css";

// Desktop: the scene pins and scrolling deals the panels onto a stack — each new
// role slides forward while the earlier ones recede (scale, fade, blur).
// Compact screens and reduced motion: a plain list, nothing pinned.
function stackPanels(root: HTMLElement, motion: Motion) {
  if (motion.reduced || motion.compact) return;
  const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root);
  const scene = root.closest("section");
  if (panels.length < 2 || !scene) return;

  root.setAttribute("data-stacked", "");
  gsap.set(panels.slice(1), { yPercent: 115, autoAlpha: 0 });

  const tl = gsap.timeline({
    defaults: { ease: "none", duration: 1 },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: () => `+=${(panels.length - 1) * window.innerHeight * 0.7}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  });

  panels.slice(1).forEach((panel, i) => {
    const step = i + 1;
    const at = `step${step}`;
    tl.addLabel(at);
    panels.slice(0, step).forEach((behind, j) => {
      const depth = step - j;
      tl.to(
        behind,
        {
          scale: 1 - depth * 0.06,
          yPercent: -depth * 9,
          autoAlpha: Math.max(0, 1 - depth * 0.32),
          filter: `blur(${depth * 1.5}px)`,
        },
        at,
      );
    });
    tl.fromTo(panel, { yPercent: 115, rotation: 3, autoAlpha: 0 }, { yPercent: 0, rotation: 0, autoAlpha: 1 }, at);
  });

  return () => root.removeAttribute("data-stacked");
}

// The company logo exactly as uploaded (no tile behind it), never cropped; a
// quiet initial stands in when there's no logo or it fails to load.
function CompanyLogo({ src, company }: { src?: string | null; company: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className={`${styles.logo} ${styles.logoFallback}`} aria-hidden="true">
        {(company ?? "?").charAt(0)}
      </span>
    );
  }
  return (
    <Image
      className={styles.logo}
      src={src}
      alt=""
      width={44}
      height={44}
      // our /media logos are resized by the optimizer (SVGs pass through);
      // an external URL is shown as-is rather than allow-listing its host
      unoptimized={!src.startsWith("/")}
      onError={() => setFailed(true)}
    />
  );
}

export default function ExperienceStack({ roles }: { roles: Experience[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useSceneAnimation(ref, stackPanels);

  return (
    // the list reveals as one piece; the panels themselves belong to the stacking timeline
    <ol ref={ref} className={styles.stack} data-reveal="item">
      {roles.map((role, i) => (
        <li key={role.id ?? i} className={`${s.glass} ${styles.panel}`} data-panel>
          <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
          <div className={styles.body}>
            <div className={styles.head}>
              <CompanyLogo src={role.logoUrl} company={role.company} />
              <div>
                <p className={s.soon}>{role.kind}</p>
                <h3 className={styles.company}>{role.company ?? "Company — to be added"}</h3>
              </div>
            </div>
            <p className={styles.meta}>
              {role.role ?? "Role"}
              {role.period && <span className={styles.period}> · {role.period}</span>}
            </p>
            {role.summary ? (
              <p className={styles.summary}>{role.summary}</p>
            ) : (
              !role.highlights?.length && <p className={styles.summary}>Details coming soon.</p>
            )}
            {role.highlights && role.highlights.length > 0 && (
              <ul className={styles.highlights}>
                {role.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {role.technologies && role.technologies.length > 0 && (
              <ul className={styles.tags} aria-label="Technologies">
                {role.technologies.map((tech) => (
                  <li key={tech} className={styles.tag}>
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

"use client";

import { useRef } from "react";
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

export default function ExperienceStack({ roles }: { roles: Experience[] }) {
  const ref = useRef<HTMLOListElement>(null);
  useSceneAnimation(ref, stackPanels);

  return (
    // the list reveals as one piece; the panels themselves belong to the stacking timeline
    <ol ref={ref} className={styles.stack} data-reveal="item">
      {roles.map((role, i) => (
        <li key={i} className={`${s.glass} ${styles.panel}`} data-panel>
          <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
          <div>
            <p className={s.soon}>{role.kind}</p>
            <h3 className={styles.company}>{role.company ?? "Company — to be added"}</h3>
            <p className={styles.meta}>
              {role.role ?? "Role"} · {role.period ?? "Dates"}
            </p>
            <p className={styles.summary}>{role.summary ?? "Details coming soon."}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

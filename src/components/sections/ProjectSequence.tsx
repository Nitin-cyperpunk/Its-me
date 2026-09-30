"use client";

import { useRef } from "react";
import type { Project } from "@/content/portfolio";
import { gsap, type Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
import s from "./scenes.module.css";
import styles from "./projects.module.css";

// Desktop: one dominant project at a time. The scene pins; scrolling sends the
// current project away and turns the next one into view, while the index of
// smaller project objects tracks which one is up. Hover tilts the card.
// Compact screens and reduced motion: a plain column of cards.
function sequence(root: HTMLElement, motion: Motion) {
  const cards = gsap.utils.toArray<HTMLElement>("[data-project]", root);
  const cleanups: (() => void)[] = [];

  // hover: slight 3D tilt toward the pointer (fine pointers only)
  if (!motion.reduced && !motion.touch) {
    cards.forEach((card) => {
      const tilt = card.querySelector<HTMLElement>("[data-tilt]")!;
      const toX = gsap.quickTo(tilt, "rotationY", { duration: 0.6, ease: "power3.out" });
      const toY = gsap.quickTo(tilt, "rotationX", { duration: 0.6, ease: "power3.out" });
      gsap.set(tilt, { transformPerspective: 1200 });
      const onMove = (e: PointerEvent) => {
        const r = tilt.getBoundingClientRect();
        toX(((e.clientX - r.left) / r.width - 0.5) * 8);
        toY(-((e.clientY - r.top) / r.height - 0.5) * 8);
      };
      const onLeave = () => {
        toX(0);
        toY(0);
      };
      tilt.addEventListener("pointermove", onMove);
      tilt.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        tilt.removeEventListener("pointermove", onMove);
        tilt.removeEventListener("pointerleave", onLeave);
      });
    });
  }

  const scene = root.closest("section");
  if (motion.reduced || motion.compact || cards.length < 2 || !scene) {
    return () => cleanups.forEach((fn) => fn());
  }

  root.setAttribute("data-sequenced", "");
  const markers = gsap.utils.toArray<HTMLElement>("[data-marker]", root);
  let current = -1;
  const mark = (index: number) => {
    if (index === current) return;
    current = index;
    markers.forEach((m, i) => (i === index ? m.setAttribute("aria-current", "true") : m.removeAttribute("aria-current")));
  };
  mark(0);

  gsap.set(cards.slice(1), { xPercent: 40, rotation: 6, scale: 0.9, autoAlpha: 0 });
  const tl = gsap.timeline({
    defaults: { ease: "none", duration: 1 },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: () => `+=${(cards.length - 1) * window.innerHeight * 0.8}`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => mark(Math.round(self.progress * (cards.length - 1))),
    },
  });
  cards.slice(1).forEach((card, i) => {
    tl.to(cards[i], { xPercent: -45, rotation: -5, scale: 0.85, autoAlpha: 0 }, i).to(
      card,
      { xPercent: 0, rotation: 0, scale: 1, autoAlpha: 1 },
      i,
    );
  });

  return () => {
    cleanups.forEach((fn) => fn());
    root.removeAttribute("data-sequenced");
    markers.forEach((m) => m.removeAttribute("aria-current"));
  };
}

export default function ProjectSequence({ items }: { items: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneAnimation(ref, sequence);

  return (
    <div ref={ref} className={styles.sequence}>
      {/* the smaller floating project objects: an index of everything on the shelf */}
      <ol className={styles.index} aria-label="All projects">
        {items.map((project, i) => (
          <li key={project.name} className={`${s.chip} ${styles.marker}`} data-marker data-reveal="item">
            <span className={styles.markerNumber}>{String(i + 1).padStart(2, "0")}</span>
            {project.name}
          </li>
        ))}
      </ol>

      {/* the stage reveals as one piece; the cards belong to the sequence timeline */}
      <div className={styles.stage} data-reveal="item">
        {items.map((project, i) => (
          <article key={project.name} className={styles.card} data-project>
            <div className={`${s.glass} ${styles.cardInner}`} data-tilt>
              {/* visual slot: a screenshot or artefact goes here later */}
              <div className={styles.visual} aria-hidden="true">
                <span>{project.name.charAt(0)}</span>
              </div>
              <div className={styles.body}>
                <p className={s.soon}>
                  {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {project.kind}
                </p>
                <h3 className={styles.name}>{project.name}</h3>
                <p className={styles.summary}>{project.summary}</p>
                <p className={s.soon}>
                  {project.stack ? project.stack.join(" · ") : "Case study coming soon"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

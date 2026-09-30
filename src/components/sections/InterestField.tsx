"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { Interest } from "@/content/portfolio";
import { gsap, type Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
import styles from "./beyond.module.css";

// Simple line icons as placeholders until real assets are connected (Interest.image).
const ICONS: Record<Interest["icon"], string> = {
  shuttle: "M12 21a2 2 0 0 1-2-2v-2h4v2a2 2 0 0 1-2 2z M10 17 6 4 M14 17 18 4 M12 17V3 M8 10h8",
  ball: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8l4 3-1.5 4.5h-5L8 11z M12 8V3.5 M16 11l4-1 M14.5 15.5 17 19 M9.5 15.5 7 19 M8 11l-4-1",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5 M8 7h7",
  dumbbell: "M3 10v4 M6 7v10 M18 7v10 M21 10v4 M6 12h12",
  plane: "M3 12l18-8-6 17-3-7z M12 14l9-10",
  cup: "M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z M16 10h1.5a2.5 2.5 0 0 1 0 5H16 M8 3.5v2 M11.5 3.5v2",
  note: "M9 18V5l11-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
};

// Objects drift slowly (shared scene float); on hover one leans toward the
// cursor and its label slides in. Fine pointers only — on touch the labels
// are simply always shown.
function lean(root: HTMLElement, motion: Motion) {
  if (motion.reduced || motion.touch) return;
  const cleanups = gsap.utils.toArray<HTMLElement>("[data-interest]", root).map((item) => {
    const toX = gsap.quickTo(item, "x", { duration: 0.6, ease: "power3.out" });
    const toY = gsap.quickTo(item, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = item.getBoundingClientRect();
      toX((e.clientX - (r.left + r.width / 2)) * 0.35);
      toY((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const onLeave = () => {
      toX(0);
      toY(0);
    };
    item.addEventListener("pointermove", onMove);
    item.addEventListener("pointerleave", onLeave);
    return () => {
      item.removeEventListener("pointermove", onMove);
      item.removeEventListener("pointerleave", onLeave);
    };
  });
  return () => cleanups.forEach((fn) => fn());
}

export default function InterestField({ items }: { items: Interest[] }) {
  const ref = useRef<HTMLUListElement>(null);
  useSceneAnimation(ref, lean);

  return (
    <ul ref={ref} className={styles.field} aria-label="Interests">
      {items.map((interest, i) => (
        <li
          key={interest.name}
          className={styles.slot}
          style={{ "--x": interest.x, "--y": interest.y } as CSSProperties}
        >
          {/* one layer per motion: reveal → idle float → pointer lean */}
          <div data-reveal="item">
          <div data-float={8 + (i % 3) * 4}>
            <div className={styles.item} data-interest tabIndex={0}>
              <span className={styles.object}>
                {interest.image ? (
                  <Image src={interest.image} alt="" width={96} height={96} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={ICONS[interest.icon]} />
                  </svg>
                )}
              </span>
              <span className={styles.label}>{interest.name}</span>
            </div>
          </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

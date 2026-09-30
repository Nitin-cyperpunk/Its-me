"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { revealScene } from "@/lib/animations/reveal";
import type { Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
import styles from "./scenes.module.css";

const withExit = (root: HTMLElement, motion: Motion) => revealScene(root, motion);
const withoutExit = (root: HTMLElement, motion: Motion) => revealScene(root, motion, { exit: false });

// A full-viewport scene. Markup stays server-rendered; this only attaches the
// shared enter / active / exit choreography (see lib/animations/reveal.ts).
export default function Scene({
  id,
  labelledBy,
  className = "",
  style,
  exit = true,
  children,
}: {
  id: string;
  labelledBy: string;
  className?: string;
  style?: CSSProperties;
  /** Pinned scenes run their own sequence and skip the exit drift. */
  exit?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useSceneAnimation(ref, exit ? withExit : withoutExit);

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`${styles.scene} ${className}`}
      style={style}
    >
      {children}
    </section>
  );
}

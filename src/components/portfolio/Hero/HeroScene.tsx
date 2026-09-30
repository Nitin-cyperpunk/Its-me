"use client";

import { useRef, type ReactNode } from "react";
import { useHeroAnimations } from "./useHeroAnimations";

// The only client component in the hero. Everything inside is server-rendered;
// this adds the motion and the mode switching by selecting data attributes.
// Smooth scrolling comes from the app-wide Lenis instance in SmoothScroll.
export default function HeroScene({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useHeroAnimations(ref);

  return (
    <section ref={ref} className={className} aria-label="Introduction">
      {children}
    </section>
  );
}

"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { intro } from "@/lib/intro";
import { gsap, MOTION_QUERIES, ScrollTrigger, type Motion } from "./gsap";

/**
 * Runs a scene's animation setup inside gsap.matchMedia, so it is rebuilt when
 * the breakpoint, pointer type or motion preference changes, and everything it
 * created (tweens, ScrollTriggers, pins) is reverted on unmount.
 * Pass a module-level function so the effect runs once.
 */
export function useSceneAnimation<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (root: T, motion: Motion) => void | (() => void),
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);
    mm.add(MOTION_QUERIES, (context) => {
      const { desktop, touch, reduce } = context.conditions!;
      return setup(root, { reduced: Boolean(reduce), touch: Boolean(touch), compact: !desktop });
    });
    return () => mm.revert();
  }, [ref, setup]);
}

/**
 * Re-measures every ScrollTrigger once the layout has settled: web fonts,
 * images, and the terminal intro handing the page back (it hides the
 * scrollbar while it plays, which shifts widths). Mount once.
 */
export function useScrollRefresh() {
  useEffect(() => {
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) refresh();
    });
    if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
    const stop = intro.subscribe(() => {
      if (intro.phase === "done") refresh();
    });

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
      stop();
    };
  }, []);
}

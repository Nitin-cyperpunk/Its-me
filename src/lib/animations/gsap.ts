// The one place new code gets GSAP from: plugins are registered once, here.
// (Older components register ScrollTrigger themselves; registering twice is harmless.)
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Media conditions every scene animation is set up against. */
export const MOTION_QUERIES = {
  // one of these two always matches, so setups always run
  desktop: "(min-width: 1024px)",
  compact: "(max-width: 1023.98px)",
  touch: "(hover: none), (pointer: coarse)",
  reduce: "(prefers-reduced-motion: reduce)",
};

export type Motion = {
  /** prefers-reduced-motion: content stays put and visible. */
  reduced: boolean;
  /** No precise pointer: no pointer-follow effects, gentler parallax. */
  touch: boolean;
  /** Below 1024px: scenes are recomposed, nothing is pinned. */
  compact: boolean;
};

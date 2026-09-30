// Hand-off between the terminal intro and the page underneath it.
//
// The intro overlay is server-rendered with the page (marked [data-intro]), so
// anything that mounts under it can tell synchronously that it's covered —
// no matter which component's effect happens to run first.
//
//   pending → the terminal is playing; hold entrances, keep scroll locked
//   reveal  → the page is being uncovered; play entrances (at `timeScale`)
//   done    → the overlay is gone; everything behaves normally

export type IntroPhase = "pending" | "reveal" | "done";

let phase: IntroPhase = "pending";
let timeScale = 1;
const listeners = new Set<() => void>();

const overlayPresent = () =>
  typeof document !== "undefined" && document.querySelector("[data-intro]") !== null;

export const intro = {
  get phase() {
    return phase;
  },
  /** Speed for entrances that start on reveal (skipping the intro plays them faster). */
  get timeScale() {
    return timeScale;
  },
  /** An intro is covering the page and hasn't started uncovering it yet. */
  holdsEntrance: () => phase === "pending" && overlayPresent(),
  /** An intro is on screen, so the page shouldn't scroll. */
  locksScroll: () => phase !== "done" && overlayPresent(),

  set(next: IntroPhase, options?: { timeScale?: number }) {
    phase = next;
    if (options?.timeScale) timeScale = options.timeScale;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

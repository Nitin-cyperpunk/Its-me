// The four controls under the intro. Each one re-arranges the same desk:
// the assets in `focus` come forward (and take any pose the asset defines for
// that mode in hero-assets.ts), everything else steps back.

export type HeroMode = "work" | "life" | "play" | "ideas";

export const DEFAULT_MODE: HeroMode = "work";

export type HeroModeConfig = {
  id: HeroMode;
  /** Tooltip and accessible name. */
  label: string;
  /** Path data for a 24×24 stroked icon. */
  icon: string;
  /** Asset ids this mode brings forward. */
  focus: string[];
  /** Opacity of everything not in focus (1 = no fading). */
  dim: number;
};

export const heroModes: HeroModeConfig[] = [
  {
    id: "work",
    label: "Work",
    icon: "M5 6h14v9H5z M3 18.5h18",
    focus: ["laptop", "jobfill", "ordra", "rentsetgo", "n8n"],
    // the desk as it opens: nothing fades
    dim: 1,
  },
  {
    id: "life",
    label: "Life",
    icon: "M5 9h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z M16 10h1.5a2.5 2.5 0 0 1 0 5H16 M8 3.5v2 M11.5 3.5v2",
    focus: ["books", "coffee", "mountain", "map", "backpack", "camera", "music", "plant"],
    dim: 0.45,
  },
  {
    id: "play",
    label: "Play",
    icon: "M3 10v4 M6 7v10 M18 7v10 M21 10v4 M6 12h12",
    focus: ["badminton", "football", "dumbbells"],
    dim: 0.45,
  },
  {
    id: "ideas",
    label: "Ideas",
    icon: "M4 20l1-4L16 5l3 3L8 19z M14 7l3 3",
    focus: ["ai-note", "ordra", "rentsetgo", "jobfill", "n8n"],
    dim: 0.45,
  },
];

export const modeMotion = {
  duration: 1,
  ease: "power3.inOut",
  /** Delay between one object starting to move and the next. */
  stagger: 0.025,
  /** Added to a focused asset's z-index. */
  focusZ: 100,
  /** Scale of everything not in focus (when the mode fades things at all). */
  restScale: 0.92,
  /** Below 1024px there are no hand-placed mode poses: focused assets grow
      and lean this far (0–1) toward `compactAnchor` instead. */
  compactFocusScale: 1.14,
  compactPull: 0.18,
  compactAnchor: { x: 50, y: 74 },
};

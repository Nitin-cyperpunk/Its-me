// Everything on the desk. Tune the composition here — nothing else hardcodes
// a position. `default` is the desk as it opens; `modes` lists only the poses
// that differ when a control is pressed (see hero-modes.ts).

import type { HeroMode } from "./hero-modes";

// The folder really is spelled this way in public/.
const DIR = "/Assests";
const OBJECTS = `${DIR}/portfolio_assets_12_separate_transparent`;

export const heroBackground = { src: `${DIR}/Landing bg.png` };

export const heroText = {
  name: "Nitin Singh",
  role: "AI Full-Stack Developer",
  tagline: ["Build", "Learn", "Ship"],
  intro: "I build web & mobile products, explore AI, and turn ideas into real-world projects.",
  /** Handwritten nudge next to the controls. */
  controlsNote: "rearrange my desk",
};

// Plug a playlist / track URL in here and the player becomes a link to it.
export const heroMusic: { provider: "spotify"; url: string | null } = {
  provider: "spotify",
  url: null,
};

/** Centre point in % of the scene, rotation in degrees, scale as a multiplier of `width`. */
export type Pose = { x: number; y: number; rotation: number; scale: number };

/** Beats of the entrance, in order (timings in heroMotion.entrance.groups). */
export type EnterGroup = "laptop" | "books" | "coffee" | "travel" | "sports" | "music" | "projects";

type BaseAsset = {
  id: string;
  /** Width in % of the scene width, at scale 1. */
  width: number;
  default: Pose;
  modes?: Partial<Record<HeroMode, Partial<Pose>>>;
  /** Layout below 1024px; null hides the asset there. */
  compact: { x: number; y: number; width: number } | null;
  zIndex: number;
  /** Parallax depth: 0.25 back, 0.5 middle, 0.8 foreground, 1 important. */
  depth: number;
  draggable: boolean;
  group: EnterGroup;
  /** Barely-there idle movement: px up/down and/or degrees of sway. */
  idle?: { y?: number; rotation?: number };
  /** A strip of paper tape across the top, or a pin through it. */
  fix?: "tape" | "pin";
  /** Handwritten note that travels with the asset (desktop only). */
  caption?: string;
};

type ImageFields = {
  src: string;
  /** Intrinsic size of the file. */
  intrinsic: [width: number, height: number];
  alt: string;
  /** Load immediately instead of lazily. */
  eager?: boolean;
};

export type ImageAsset = BaseAsset & ImageFields & { kind: "image" };
export type MusicAsset = BaseAsset & ImageFields & { kind: "music" };
export type ProjectAsset = BaseAsset & {
  kind: "project";
  variant: "ticket" | "print" | "browser" | "workflow" | "sticky";
  label: string;
  title: string;
  description: string;
  /** Where a click goes; null renders the artifact as a plain object. */
  projectLink: string | null;
};

export type HeroAsset = ImageAsset | MusicAsset | ProjectAsset;

// The projects section doesn't exist yet. Once it does, give it id="projects"
// and set this to "#projects" — every artifact becomes a link to it.
const PROJECTS: string | null = null;

export const heroAssets: HeroAsset[] = [
  // ---------- coding ----------
  {
    id: "laptop",
    kind: "image",
    src: `${DIR}/mac.png`,
    intrinsic: [1313, 1198],
    alt: "Laptop",
    eager: true,
    width: 27,
    default: { x: 17, y: 27, rotation: -7, scale: 1 },
    modes: {
      life: { x: 11, y: 13, rotation: -13, scale: 0.68 },
      play: { x: 12, y: 14, rotation: -11, scale: 0.7 },
      ideas: { x: 11, y: 14, rotation: -12, scale: 0.68 },
    },
    compact: { x: 62, y: 73, width: 66 },
    zIndex: 30,
    depth: 1,
    draggable: true,
    group: "laptop",
  },

  // ---------- projects ----------
  {
    id: "jobfill",
    kind: "project",
    variant: "browser",
    label: "Chrome extension",
    title: "JobFill",
    description: "Autofills job applications",
    projectLink: PROJECTS,
    width: 11,
    // leans on the corner of the laptop
    default: { x: 27, y: 54, rotation: 5, scale: 1 },
    modes: {
      life: { x: 5, y: 47, rotation: -7, scale: 0.85 },
      play: { x: 6, y: 50, rotation: -5, scale: 0.85 },
      ideas: { x: 24, y: 72, rotation: 5, scale: 1.2 },
    },
    compact: null,
    zIndex: 34,
    depth: 0.8,
    draggable: true,
    group: "projects",
  },
  {
    id: "ordra",
    kind: "project",
    variant: "ticket",
    label: "SaaS",
    title: "Ordra",
    description: "Cafe management",
    projectLink: PROJECTS,
    fix: "pin",
    width: 9.5,
    // pinned over the edge of the mountain photo
    default: { x: 50.5, y: 11, rotation: 6, scale: 1 },
    modes: {
      life: { x: 53, y: 4, rotation: -3, scale: 0.8 },
      play: { x: 56, y: 9, rotation: 5 },
      ideas: { x: 40, y: 15, rotation: -5, scale: 1.3 },
    },
    compact: { x: 14, y: 77, width: 25 },
    zIndex: 24,
    depth: 0.5,
    draggable: true,
    group: "projects",
  },
  {
    id: "rentsetgo",
    kind: "project",
    variant: "print",
    label: "SaaS",
    title: "RentSetGo",
    description: "Property listings",
    projectLink: PROJECTS,
    width: 10,
    default: { x: 87, y: 35, rotation: -6, scale: 1 },
    modes: {
      life: { x: 94, y: 12, rotation: 10, scale: 0.8 },
      play: { x: 92, y: 15, rotation: 8, scale: 0.85 },
      ideas: { x: 62, y: 14, rotation: 4, scale: 1.25 },
    },
    compact: null,
    // tucked partly under the map and the backpack
    zIndex: 12,
    depth: 0.5,
    draggable: true,
    group: "projects",
  },
  {
    id: "n8n",
    kind: "project",
    variant: "workflow",
    label: "Automation",
    title: "n8n",
    description: "Workflows that run themselves",
    projectLink: PROJECTS,
    width: 11,
    default: { x: 92, y: 80, rotation: -3, scale: 1 },
    modes: {
      ideas: { x: 76, y: 45, rotation: 5, scale: 1.3 },
    },
    compact: null,
    zIndex: 26,
    depth: 0.8,
    draggable: true,
    group: "projects",
  },
  {
    id: "ai-note",
    kind: "project",
    variant: "sticky",
    label: "Lab",
    title: "AI experiments",
    description: "agents, automations & odd ideas",
    projectLink: PROJECTS,
    width: 8,
    // stuck half over the shuttlecock
    default: { x: 24.5, y: 84, rotation: -7, scale: 1 },
    modes: {
      ideas: { x: 25, y: 42, rotation: -7, scale: 1.6 },
    },
    compact: null,
    zIndex: 22,
    depth: 0.8,
    draggable: true,
    group: "projects",
  },

  // ---------- reading, coffee ----------
  {
    id: "books",
    kind: "image",
    src: `${OBJECTS}/books.png`,
    intrinsic: [380, 293],
    alt: "Stack of programming books",
    width: 12,
    default: { x: 8, y: 66, rotation: -6, scale: 1 },
    modes: {
      life: { x: 22, y: 40, rotation: -4, scale: 1.35 },
    },
    compact: { x: 16, y: 59, width: 28 },
    zIndex: 28,
    depth: 0.5,
    draggable: true,
    group: "books",
  },
  {
    id: "coffee",
    kind: "image",
    src: `${DIR}/coffee.png`,
    intrinsic: [1312, 1199],
    alt: "Cup of coffee",
    width: 9,
    default: { x: 73, y: 70, rotation: -6, scale: 1 },
    modes: {
      life: { x: 27, y: 71, rotation: 6, scale: 1.4 },
      play: { x: 55, y: 92, rotation: -10, scale: 0.9 },
    },
    compact: { x: 86, y: 91, width: 24 },
    zIndex: 36,
    depth: 0.8,
    draggable: true,
    group: "coffee",
    idle: { y: 2 },
  },

  // ---------- travel ----------
  {
    id: "mountain",
    kind: "image",
    src: `${OBJECTS}/mountain.png`,
    intrinsic: [445, 304],
    alt: "Snow-capped mountain",
    fix: "tape",
    width: 13,
    default: { x: 40, y: 11, rotation: -3, scale: 1 },
    modes: {
      life: { x: 37, y: 14, rotation: 2, scale: 1.45 },
      ideas: { x: 51, y: 4, rotation: 3, scale: 0.75 },
    },
    compact: { x: 52, y: 48, width: 30 },
    zIndex: 10,
    depth: 0.25,
    draggable: true,
    group: "travel",
  },
  {
    id: "camera",
    kind: "image",
    src: `${OBJECTS}/camera.png`,
    intrinsic: [330, 318],
    alt: "Camera",
    width: 8,
    default: { x: 65, y: 13, rotation: -8, scale: 1 },
    modes: {
      life: { x: 62, y: 13, rotation: -5, scale: 1.2 },
      ideas: { x: 75, y: 9, rotation: -10 },
    },
    compact: null,
    zIndex: 18,
    depth: 0.5,
    draggable: true,
    group: "travel",
  },
  {
    id: "map",
    kind: "image",
    src: `${OBJECTS}/map_compass.png`,
    intrinsic: [378, 354],
    alt: "Folded map and compass",
    width: 11,
    default: { x: 84, y: 15, rotation: 9, scale: 1 },
    modes: {
      life: { x: 75, y: 23, rotation: 6, scale: 1.3 },
    },
    compact: null,
    zIndex: 16,
    depth: 0.5,
    draggable: true,
    group: "travel",
  },
  {
    id: "backpack",
    kind: "image",
    src: `${OBJECTS}/backpack.png`,
    intrinsic: [337, 317],
    alt: "Travel backpack",
    width: 10.5,
    // hangs off the right edge of the desk
    default: { x: 96, y: 31, rotation: 6, scale: 1 },
    modes: {
      life: { x: 89, y: 41, rotation: 4, scale: 1.3 },
    },
    compact: null,
    zIndex: 20,
    depth: 0.8,
    draggable: true,
    group: "travel",
  },

  // ---------- sport ----------
  {
    id: "badminton",
    kind: "image",
    src: `${OBJECTS}/badminton.png`,
    intrinsic: [254, 358],
    alt: "Badminton racket and shuttlecock",
    width: 7.5,
    default: { x: 17, y: 88, rotation: 12, scale: 1 },
    modes: {
      play: { x: 24, y: 45, rotation: -12, scale: 1.9 },
    },
    compact: { x: 92, y: 55, width: 17 },
    zIndex: 25,
    depth: 0.8,
    draggable: true,
    group: "sports",
  },
  {
    id: "football",
    kind: "image",
    src: `${OBJECTS}/football.png`,
    intrinsic: [291, 286],
    alt: "Football",
    width: 7,
    default: { x: 63, y: 93, rotation: 10, scale: 1 },
    modes: {
      play: { x: 75, y: 41, rotation: 28, scale: 1.9 },
    },
    compact: null,
    zIndex: 27,
    depth: 1,
    draggable: true,
    group: "sports",
    idle: { rotation: 1.5 },
  },
  {
    id: "dumbbells",
    kind: "image",
    src: `${OBJECTS}/dumbbells.png`,
    intrinsic: [402, 329],
    alt: "Dumbbell",
    width: 11.5,
    // half off the bottom of the desk
    default: { x: 79, y: 94, rotation: -6, scale: 1 },
    modes: {
      play: { x: 72, y: 90, rotation: -9, scale: 1.25 },
    },
    compact: null,
    zIndex: 23,
    depth: 0.8,
    draggable: true,
    group: "sports",
  },

  // ---------- music, plant ----------
  {
    id: "music",
    kind: "music",
    src: `${OBJECTS}/music_player.png`,
    intrinsic: [344, 318],
    alt: "Music player showing Good Days by SZA",
    caption: "on repeat",
    width: 13,
    default: { x: 87, y: 57, rotation: 7, scale: 1 },
    modes: {
      life: { x: 76, y: 67, rotation: -5, scale: 1.2 },
      ideas: { x: 91, y: 66, rotation: 10 },
    },
    compact: { x: 26, y: 91, width: 36 },
    zIndex: 32,
    depth: 1,
    draggable: true,
    group: "music",
    idle: { rotation: 1 },
  },
  {
    id: "plant",
    kind: "image",
    src: `${OBJECTS}/plant.png`,
    intrinsic: [333, 339],
    alt: "",
    width: 9,
    // pushed into the bottom-left corner, partly off the desk
    default: { x: 3.5, y: 91, rotation: -4, scale: 1 },
    modes: {
      life: { x: 8, y: 85, rotation: 0, scale: 1.3 },
    },
    compact: null,
    zIndex: 21,
    depth: 0.5,
    draggable: true,
    group: "coffee",
    idle: { y: 3 },
  },
];

export const heroMotion = {
  entrance: {
    /** Seconds from the reveal. The desk fades in at 0 (under the intro's glass),
        the objects land, then the name, the lines under it and the controls. */
    name: 1.95,
    text: 2.1,
    controls: 2.35,
    decor: 2.45,
    /** Delay between objects that share a group. */
    stagger: 0.07,
    /** Every object starts this far below, this small, at a random tilt up to `tilt`°. */
    rise: 30,
    scale: 0.85,
    tilt: 14,
    groups: {
      laptop: { at: 0.45, duration: 1.2, ease: "expo.out" },
      books: { at: 0.55, duration: 1, ease: "power3.out" },
      coffee: { at: 0.65, duration: 1, ease: "back.out(1.3)" },
      travel: { at: 0.75, duration: 1, ease: "power3.out" },
      sports: { at: 0.85, duration: 1, ease: "power3.out" },
      music: { at: 0.95, duration: 1, ease: "back.out(1.3)" },
      projects: { at: 1.05, duration: 0.9, ease: "power3.out" },
    } satisfies Record<EnterGroup, { at: number; duration: number; ease: string }>,
  },
  /** Pointer parallax travel in px at depth 1; the desk itself moves at `background`. */
  parallax: { strength: 18, background: 0.1 },
  hover: { scale: 1.03, rotate: 1.5 },
  drag: { scale: 1.04 },
  /** Seconds per half cycle of the idle movement. */
  idle: { duration: 3.4 },
  /** Leaving the hero: px travelled at depth 1, sideways spread, extra rotation,
      how far the objects fade, desk drift (% of its height) and zoom, and how far
      the text rises (× viewport height). */
  exit: {
    travel: 140,
    spread: 40,
    rotate: 4,
    fade: 0.55,
    background: 8,
    backgroundScale: 1.05,
    text: 0.18,
  },
};

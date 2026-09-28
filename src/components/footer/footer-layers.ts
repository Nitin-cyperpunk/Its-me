// Single source of truth for the footer landscape. Layers are the PNGs in
// public/Assests/, pre-aligned to share one canvas. To swap artwork, replace
// the files and adjust the values here — nothing else references the paths.

export type FooterLayer = {
  id: "sky" | "mountains" | "city" | "fog" | "trees";
  src: string;
  width: number;
  height: number;
  /** Scroll parallax: starting offset as a fraction of the layer's height. Back layers small, front layers large. */
  depth: number;
  /** Resting scale — just enough headroom that pointer movement never exposes an edge. */
  scale: number;
  /** Desktop pointer parallax travel in px (0 = static). */
  pointer: number;
  /** Extra lag in px at high scroll velocity (0 = none). */
  drag: number;
  /** Start/end of this layer's reveal on the 0–1 scroll timeline. */
  reveal: [start: number, end: number];
  /** Opacity the layer reveals from. */
  revealFrom: number;
};

// Back to front — this order is also the paint order.
export const footerLayers: FooterLayer[] = [
  {
    id: "sky",
    src: "/Assests/01-sky-layer.png",
    width: 836,
    height: 271,
    depth: 0.05,
    scale: 1.02,
    pointer: 2,
    drag: 0,
    reveal: [0, 0.6],
    revealFrom: 0.2,
  },
  {
    id: "mountains",
    src: "/Assests/02-mountains-layer.png",
    width: 2170,
    height: 725,
    depth: 0.12,
    scale: 1.02,
    pointer: 5,
    drag: 0,
    reveal: [0.08, 0.7],
    revealFrom: 0,
  },
  {
    id: "city",
    src: "/Assests/03-city-layer.png",
    width: 2170,
    height: 725,
    depth: 0.18,
    scale: 1.03,
    pointer: 8,
    drag: 0,
    reveal: [0.16, 0.8],
    revealFrom: 0,
  },
  {
    id: "fog",
    src: "/Assests/05-fog-layer.png",
    width: 2170,
    height: 725,
    depth: 0.25,
    scale: 1.04,
    pointer: 12,
    drag: 8,
    reveal: [0.22, 0.88],
    revealFrom: 0,
  },
  {
    id: "trees",
    src: "/Assests/04-foreground-trees-layer.png",
    width: 2170,
    height: 725,
    depth: 0.35,
    scale: 1.04,
    pointer: 18,
    drag: 12,
    reveal: [0.28, 1],
    revealFrom: 0,
  },
];

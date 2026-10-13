// Particles for the skills constellation (desktop): at rest they sit as faint
// beads along the constellation's own threads; when a skill is selected they
// fly into its shape — a database cylinder, or the outline of its brand logo —
// and drift back to the threads when it's released.
//
// One small canvas, drawn only while something moves. GSAP (already used by
// the scenes) does the tweening; re-targeting mid-flight is smooth because each
// particle is simply sent to its new spot (overwrite).

import { gsap } from "@/lib/animations/gsap";

export type Shape = { kind: "database" } | { kind: "icon"; path: string };
type Point = { x: number; y: number };
type Particle = Point & { r: number; a: number };

const COUNT = 120;

// --- geometry -----------------------------------------------------------------

/** n points spread evenly (by length) along a set of polylines. */
function sampleLines(lines: Point[][], n: number): Point[] {
  const segs: { a: Point; b: Point; len: number }[] = [];
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      segs.push({ a, b, len: Math.hypot(b.x - a.x, b.y - a.y) });
    }
  }
  const total = segs.reduce((sum, s) => sum + s.len, 0) || 1;
  const out: Point[] = [];
  let seg = 0;
  let walked = 0;
  for (let i = 0; i < n; i++) {
    const at = ((i + 0.5) / n) * total;
    while (seg < segs.length - 1 && walked + segs[seg].len < at) walked += segs[seg++].len;
    const s = segs[seg];
    const t = s.len ? (at - walked) / s.len : 0;
    out.push({ x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t });
  }
  return out;
}

/** A database: a full top ellipse, two stacked "disc" seams, the base, and the sides. */
function cylinder(cx: number, cy: number, size: number, n: number): Point[] {
  const rx = size * 0.42;
  const ry = size * 0.12;
  const top = cy - size * 0.38;
  const levels = [cy - size * 0.08, cy + size * 0.2, cy + size * 0.48];
  const arc = (y: number, from: number, to: number) =>
    Array.from({ length: 33 }, (_, i) => {
      const t = from + ((to - from) * i) / 32;
      return { x: cx + rx * Math.cos(t), y: y + ry * Math.sin(t) };
    });
  return sampleLines(
    [
      arc(top, 0, Math.PI * 2), // the lid, seen from slightly above
      ...levels.map((y) => arc(y, 0, Math.PI)), // front edge of each disc
      [{ x: cx - rx, y: top }, { x: cx - rx, y: levels[2] }],
      [{ x: cx + rx, y: top }, { x: cx + rx, y: levels[2] }],
    ],
    n,
  );
}

// one detached <path> for measuring logo outlines
let probe: SVGPathElement | null = null;

/** Points along the outline of a 24×24 brand icon, scaled into a size×size box. */
function iconOutline(d: string, cx: number, cy: number, size: number, n: number): Point[] | null {
  if (!probe) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.style.visibility = "hidden";
    probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.appendChild(probe);
    document.body.appendChild(svg);
  }
  probe.setAttribute("d", d);
  let length = 0;
  try {
    length = probe.getTotalLength();
  } catch {
    return null;
  }
  if (!length) return null;
  const k = size / 24;
  return Array.from({ length: n }, (_, i) => {
    const p = probe!.getPointAtLength(((i + 0.5) / n) * length);
    return { x: cx + (p.x - 12) * k, y: cy + (p.y - 12) * k };
  });
}

// --- engine ---------------------------------------------------------------------

export function createParticles(
  canvas: HTMLCanvasElement,
  /** Thread endpoints in % of the field, for the resting pattern. */
  threads: [Point, Point][],
  reduced: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const parts: Particle[] = Array.from({ length: COUNT }, () => ({ x: 0, y: 0, r: 1.2, a: 0 }));
  let width = 0;
  let height = 0;
  let shape: Shape | null = null;
  let color = "#7f9bff";

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    for (const p of parts) {
      if (p.a <= 0.01) continue;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const readColor = () => {
    color = getComputedStyle(canvas).getPropertyValue("--nv-accent").trim() || color;
  };

  // where each particle should be for the current state
  const targets = (): Particle[] => {
    if (shape) {
      const size = Math.min(height * 0.62, width * 0.42);
      const cx = width / 2;
      const cy = height / 2;
      const pts =
        shape.kind === "database"
          ? cylinder(cx, cy, size, COUNT)
          : iconOutline(shape.path, cx, cy, size, COUNT);
      if (pts) return pts.map((p) => ({ ...p, r: 1.9, a: 0.95 }));
    }
    const lines = threads.map(([a, b]) => [
      { x: (a.x / 100) * width, y: (a.y / 100) * height },
      { x: (b.x / 100) * width, y: (b.y / 100) * height },
    ]);
    return sampleLines(lines, COUNT).map((p) => ({ ...p, r: 1.1, a: 0.32 }));
  };

  const settle = (instant: boolean) => {
    const to = targets();
    gsap.killTweensOf(parts);
    if (instant || reduced) {
      parts.forEach((p, i) => Object.assign(p, to[i]));
      draw();
      return;
    }
    // shuffle the order so the formation assembles from everywhere at once
    gsap.to(parts, {
      x: (i: number) => to[i].x,
      y: (i: number) => to[i].y,
      r: (i: number) => to[i].r,
      a: (i: number) => to[i].a,
      duration: shape ? 1.15 : 0.9,
      ease: "power3.inOut",
      stagger: { amount: 0.35, from: "random" },
      overwrite: true,
      onUpdate: draw,
    });
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = box.width;
    height = box.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    settle(true);
  };

  readColor();
  resize();
  const sizer = new ResizeObserver(resize);
  sizer.observe(canvas);
  // the theme switch recolours the accent
  const themer = new MutationObserver(() => {
    readColor();
    draw();
  });
  themer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  return {
    form(next: Shape) {
      shape = next;
      settle(false);
    },
    release() {
      shape = null;
      settle(false);
    },
    destroy() {
      gsap.killTweensOf(parts);
      sizer.disconnect();
      themer.disconnect();
      ctx.clearRect(0, 0, width, height);
    },
  };
}

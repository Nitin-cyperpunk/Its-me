"use client";

import { useRef, type CSSProperties } from "react";
import type { Skill } from "@/content/portfolio";
import { gsap, type Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
import { createParticles, type Shape } from "./skill-particles";
import styles from "./skills.module.css";

/** Nodes closer than this (in % of the field) get nudged aside by the focused one. */
const REACH = 32;

// Each node links to its two nearest neighbours — computed, not hand-drawn.
function links(items: Skill[]) {
  const pairs = new Set<string>();
  items.forEach((a, i) => {
    items
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter(({ j }) => j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
      .forEach(({ j }) => pairs.add([Math.min(i, j), Math.max(i, j)].join("-")));
  });
  return [...pairs].map((key) => key.split("-").map(Number) as [number, number]);
}

// Focus a technology (hover, keyboard or tap): it lifts and glows, its note
// shows in the detail line, and its neighbours drift out of the way.
// Select one (click / Enter) on desktop: the particles resting on the threads
// fly into its shape (skill-particles.ts); select again or Escape to release.
const SELECT_HINT = " Select one to see it take shape.";

function constellation(root: HTMLElement, motion: Motion) {
  const nodes = gsap.utils.toArray<HTMLElement>("[data-skill]", root);
  const detail = root.querySelector<HTMLElement>("[data-skill-detail]")!;
  const canvas = root.querySelector<HTMLCanvasElement>("[data-particles]");
  const spread = !motion.reduced && !motion.compact && !motion.touch;

  // the resting pattern: the same threads the SVG draws
  const points = nodes.map((n) => ({ name: "", note: "", x: Number(n.dataset.x), y: Number(n.dataset.y) }));
  const threads = links(points).map(([a, b]) => [points[a], points[b]] as [Skill, Skill]);
  // formations need the desktop field (a laid-out constellation)
  const particles = !motion.compact && canvas ? createParticles(canvas, threads, motion.reduced) : null;
  const formable = (node: HTMLElement) => Boolean(particles && node.dataset.shape);
  const base = detail.textContent ?? "";
  const idle = particles && nodes.some(formable) ? base + SELECT_HINT : base;
  detail.textContent = idle;

  let selected: number | null = null;
  const resting = () =>
    selected === null ? idle : `${nodes[selected].dataset.name} · ${root.dataset.category ?? ""}`;

  const movers = nodes.map((node) => ({
    x: Number(node.dataset.x),
    y: Number(node.dataset.y),
    toX: gsap.quickTo(node, "x", { duration: 0.6, ease: "power3.out" }),
    toY: gsap.quickTo(node, "y", { duration: 0.6, ease: "power3.out" }),
  }));

  const focus = (index: number | null) => {
    nodes.forEach((node, i) => node.toggleAttribute("data-active", i === index));
    detail.textContent = index === null ? resting() : `${nodes[index].dataset.name} — ${nodes[index].dataset.note}`;
    // while a logo is formed the chips stay where they are (they've stepped back)
    if (!spread || selected !== null) return;
    const at = index === null ? null : movers[index];
    movers.forEach((m, i) => {
      if (!at || i === index) {
        m.toX(0);
        m.toY(0);
        return;
      }
      const dx = m.x - at.x;
      const dy = m.y - at.y;
      const d = Math.hypot(dx, dy) || 1;
      const push = d < REACH ? (REACH - d) * 1.1 : 0;
      m.toX((dx / d) * push);
      m.toY((dy / d) * push);
    });
  };

  const select = (index: number | null) => {
    selected = index;
    nodes.forEach((node, i) => {
      node.toggleAttribute("data-selected", i === index);
      if (formable(node)) node.setAttribute("aria-pressed", String(i === index));
    });
    root.toggleAttribute("data-formed", index !== null);
    if (index === null) {
      particles?.release();
    } else {
      // the chips settle back into place before the formation takes the stage
      movers.forEach((m) => {
        m.toX(0);
        m.toY(0);
      });
      const node = nodes[index];
      const shape: Shape =
        node.dataset.shape === "database" ? { kind: "database" } : { kind: "icon", path: node.dataset.path ?? "" };
      particles?.form(shape);
    }
    detail.textContent = resting();
  };

  const handlers = nodes.map((node, i) => {
    const on = () => focus(i);
    const off = () => focus(null);
    const click = () => {
      if (formable(node)) select(selected === i ? null : i);
    };
    if (formable(node)) node.setAttribute("aria-pressed", "false");
    node.addEventListener("pointerenter", on);
    node.addEventListener("focus", on);
    node.addEventListener("pointerleave", off);
    node.addEventListener("blur", off);
    node.addEventListener("click", click);
    return () => {
      node.removeEventListener("pointerenter", on);
      node.removeEventListener("focus", on);
      node.removeEventListener("pointerleave", off);
      node.removeEventListener("blur", off);
      node.removeEventListener("click", click);
      node.removeAttribute("aria-pressed");
    };
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && selected !== null) select(null);
  };
  root.addEventListener("keydown", onKey);

  return () => {
    handlers.forEach((fn) => fn());
    root.removeEventListener("keydown", onKey);
    nodes.forEach((node) => node.removeAttribute("data-selected"));
    root.removeAttribute("data-formed");
    selected = null;
    focus(null);
    particles?.destroy();
    detail.textContent = base;
  };
}

export default function SkillConstellation({ items, category }: { items: Skill[]; category?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneAnimation(ref, constellation);

  return (
    <div ref={ref} className={styles.constellation} data-category={category}>
      <p className={styles.detail} data-skill-detail aria-live="polite">
        Hover or focus a tool to see what it’s for.
      </p>

      <div className={styles.field}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {links(items).map(([a, b]) => (
            <line key={`${a}-${b}`} x1={items[a].x} y1={items[a].y} x2={items[b].x} y2={items[b].y} />
          ))}
        </svg>

        {/* particles: beads on the threads at rest, the selected skill's shape when chosen */}
        <canvas className={styles.particles} data-particles aria-hidden="true" />

        <ul className={styles.nodes} aria-label="Tools">
          {items.map((skill) => (
            <li
              key={skill.name}
              className={styles.slot}
              style={{ "--x": skill.x, "--y": skill.y } as CSSProperties}
            >
              <button
                type="button"
                className={styles.node}
                data-skill
                data-name={skill.name}
                data-note={skill.note}
                data-x={skill.x}
                data-y={skill.y}
                data-shape={skill.shape ?? undefined}
                data-path={skill.shape === "icon" ? skill.icon?.path : undefined}
                data-reveal="item"
              >
                {/* the visible face: its CSS scale stays clear of GSAP's transforms on the button */}
                <span className={styles.face}>
                  {skill.icon && (
                    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                      <path d={skill.icon.path} />
                    </svg>
                  )}
                  {skill.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

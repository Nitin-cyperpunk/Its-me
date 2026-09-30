"use client";

import { useRef, type CSSProperties } from "react";
import type { Skill } from "@/content/portfolio";
import { gsap, type Motion } from "@/lib/animations/gsap";
import { useSceneAnimation } from "@/lib/animations/scroll";
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
function constellation(root: HTMLElement, motion: Motion) {
  const nodes = gsap.utils.toArray<HTMLElement>("[data-skill]", root);
  const detail = root.querySelector<HTMLElement>("[data-skill-detail]")!;
  const idle = detail.textContent;
  const spread = !motion.reduced && !motion.compact && !motion.touch;

  const movers = nodes.map((node) => ({
    x: Number(node.dataset.x),
    y: Number(node.dataset.y),
    toX: gsap.quickTo(node, "x", { duration: 0.6, ease: "power3.out" }),
    toY: gsap.quickTo(node, "y", { duration: 0.6, ease: "power3.out" }),
  }));

  const focus = (index: number | null) => {
    nodes.forEach((node, i) => node.toggleAttribute("data-active", i === index));
    detail.textContent = index === null ? idle : `${nodes[index].dataset.name} — ${nodes[index].dataset.note}`;
    if (!spread) return;
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

  const handlers = nodes.map((node, i) => {
    const on = () => focus(i);
    const off = () => focus(null);
    node.addEventListener("pointerenter", on);
    node.addEventListener("focus", on);
    node.addEventListener("pointerleave", off);
    node.addEventListener("blur", off);
    return () => {
      node.removeEventListener("pointerenter", on);
      node.removeEventListener("focus", on);
      node.removeEventListener("pointerleave", off);
      node.removeEventListener("blur", off);
    };
  });

  return () => {
    handlers.forEach((fn) => fn());
    focus(null);
  };
}

export default function SkillConstellation({ items }: { items: Skill[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useSceneAnimation(ref, constellation);

  return (
    <div ref={ref} className={styles.constellation}>
      <p className={styles.detail} data-skill-detail aria-live="polite">
        Hover or focus a tool to see what it’s for.
      </p>

      <div className={styles.field}>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {links(items).map(([a, b]) => (
            <line key={`${a}-${b}`} x1={items[a].x} y1={items[a].y} x2={items[b].x} y2={items[b].y} />
          ))}
        </svg>

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
                data-reveal="item"
              >
                {/* the visible face: its CSS scale stays clear of GSAP's transforms on the button */}
                <span className={styles.face}>{skill.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

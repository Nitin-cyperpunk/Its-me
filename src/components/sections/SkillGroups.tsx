"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { SkillGroup } from "@/lib/content";
import SkillConstellation from "./SkillConstellation";
import s from "./scenes.module.css";
import styles from "./skills.module.css";

// One constellation per category, one shown at a time — a single field can't
// hold every skill legibly. Tabs follow the WAI-ARIA pattern (arrow keys,
// Home/End). Each constellation sets up its own motion once, on mount.
export default function SkillGroups({ groups }: { groups: SkillGroup[] }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  if (groups.length === 1) return <SkillConstellation items={groups[0].items} category={groups[0].category} />;

  const select = (index: number) => {
    const next = (index + groups.length) % groups.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: groups.length - 1 };
    if (e.key in moves) {
      e.preventDefault();
      select(moves[e.key]);
    }
  };

  return (
    <div className={styles.groups}>
      <div className={styles.tabs} role="tablist" aria-label="Skill categories" data-reveal="item">
        {groups.map((group, i) => (
          <button
            key={group.category}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`${s.chip} ${styles.tab}`}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {group.category}
          </button>
        ))}
      </div>

      {groups.map((group, i) => (
        <div
          key={group.category}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
        >
          <SkillConstellation items={group.items} category={group.category} />
        </div>
      ))}
    </div>
  );
}

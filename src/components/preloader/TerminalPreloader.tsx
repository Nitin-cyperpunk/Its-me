"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { intro } from "@/lib/intro";
import { buildExitTimeline, buildIntroTimeline } from "./intro-timeline";
import {
  PROMPT,
  stageLabels,
  terminalPhases,
  type IntroStage,
  type TerminalLine,
} from "./terminalData";
import styles from "./terminal-preloader.module.css";

// The terminal entrance into the site. A fixed overlay above the page:
//   every load      the full ~14s terminal (refreshes included), then the
//                   page assembles under glass — "Skip intro" / Esc cut it short
//   reduced motion  a short fade, nothing else
// Everything visual is driven by GSAP; React state only tracks the stage.
export default function TerminalPreloader({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const [stage, setStage] = useState<IntroStage>("boot");

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    // the page is covered: hold its entrances and its scrolling
    intro.set("pending");
    root.classList.add("is-running");
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      html.style.overflow = overflow;
      intro.set("done");
      setStage("complete");
    };
    const reveal = (timeScale: number) => {
      if (intro.phase === "pending") intro.set("reveal", { timeScale });
    };

    const ctx = gsap.context(() => {}, root);
    let master: gsap.core.Timeline | undefined;

    ctx.add(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        reveal(1);
        gsap.to(root, { autoAlpha: 0, duration: 0.3, onComplete: finish });
      } else {
        // a refresh can restore a scrolled position; the story starts at the top
        window.scrollTo(0, 0);
        master = buildIntroTimeline(root, {
          onStage: setStage,
          onReveal: () => reveal(1),
          onDone: finish,
        }).play();
      }
    });

    skipRef.current = () => {
      if (finished || !master) return;
      ctx.add(() => {
        master!.kill();
        reveal(1.5);
        setStage("transition");
        buildExitTimeline(root, finish);
      });
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") skipRef.current?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      skipRef.current = null;
      ctx.revert();
      html.style.overflow = overflow;
    };
  }, []);

  if (stage === "complete") return null;

  return (
    <div ref={ref} className={`${styles.intro} ${className}`} data-intro data-stage={stage}>
      <div className={styles.glass} data-glass aria-hidden="true" />
      <div className={styles.backdrop} data-backdrop aria-hidden="true" />

      <div className={styles.window} data-window aria-hidden="true">
        <div className={styles.titlebar}>
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.title}>nitinverse — zsh</span>
        </div>

        <div className={styles.body} data-body>
          {terminalPhases.map((phase) => (
            <div key={phase.id} data-phase={phase.id}>
              <Prompt command />
              {phase.lines.map((line, i) => (
                <Line key={i} line={line} />
              ))}
            </div>
          ))}
          <Prompt />
        </div>
      </div>

      <p className="sr-only" role="status">
        {stageLabels[stage]}
      </p>

      <button
        type="button"
        className={styles.skip}
        data-skip
        onClick={() => skipRef.current?.()}
      >
        Skip intro →
      </button>
    </div>
  );
}

function Prompt({ command = false }: { command?: boolean }) {
  return (
    <div
      className={`${styles.line} ${styles.command}`}
      {...(command ? { "data-command": "" } : { "data-idle-prompt": "" })}
    >
      <span className={styles.user}>{PROMPT.user}</span>
      <span className={styles.dim}>:</span>
      <span className={styles.path}>{PROMPT.path}</span>
      <span className={styles.dim}>{"$ "}</span>
      {command && <span data-typed />}
      <span className={styles.cursor} />
    </div>
  );
}

// Every piece of a line is its own element with its spacing baked into the
// string: loose text nodes between siblings (a bare {" "}) got shuffled when
// the terminal re-rendered between stages.
function Stamp({ stamp }: { stamp: string }) {
  return <span className={styles.stamp}>{`${stamp} `}</span>;
}

function Line({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case "log":
      return (
        <div className={styles.line} data-line>
          <Stamp stamp={line.stamp} />
          <span className={line.tone === "accent" ? styles.accent : undefined}>{line.text}</span>
        </div>
      );
    case "field":
      return (
        <div className={styles.line} data-line>
          <Stamp stamp={line.stamp} />
          <span className={styles.label}>{line.label.padEnd(9)}</span>
          <span>{`: ${line.value}`}</span>
        </div>
      );
    case "check":
      return (
        <div className={styles.line} data-line>
          <Stamp stamp={line.stamp} />
          <span className={styles.check} data-check>
            ✓
          </span>
          <span>{` ${line.text}`}</span>
          {line.note && (
            <span className={styles.note}>
              {`\n${" ".repeat(line.stamp.length + 3)}${line.note}`}
            </span>
          )}
        </div>
      );
    case "success":
      return (
        <div className={styles.line} data-line>
          <Stamp stamp={line.stamp} />
          <span className={styles.success}>{line.text}</span>
        </div>
      );
    case "progress":
      return (
        <div className={styles.line} data-line>
          <span className={styles.progress}>
            <span className={styles.progressFill} data-progress-fill />
          </span>
          <span data-progress-label>0%</span>
        </div>
      );
    case "identity":
      return (
        <div className={`${styles.line} ${styles.identity}`} data-line>
          <span className={styles.identityName}>
            {[...line.name].map((letter, i) => (
              <span key={i} data-letter>
                {letter}
              </span>
            ))}
          </span>
          <span className={styles.identityTagline} data-tagline>
            {line.tagline}
          </span>
        </div>
      );
  }
}

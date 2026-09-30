import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { REVEAL_AT, terminalPhases, type IntroStage, type TerminalLine } from "./terminalData";

gsap.registerPlugin(TextPlugin);

type Hooks = {
  /** Major lifecycle changes only — never per frame. */
  onStage: (stage: IntroStage) => void;
  /** The terminal has turned to glass: the page may start assembling. */
  onReveal: () => void;
  onDone: () => void;
};

// The one master timeline for the full intro, 0 → ~13.7s.
export function buildIntroTimeline(root: HTMLElement, hooks: Hooks) {
  const q = gsap.utils.selector(root);
  const win = q("[data-window]")[0];
  const body = q("[data-body]")[0];
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });

  // Like a real terminal: new lines push the old ones up.
  const follow = () => {
    body.scrollTop = body.scrollHeight;
  };
  let activeLine: Element | null = null;
  const activate = (line: Element) => {
    activeLine?.removeAttribute("data-active");
    line.setAttribute("data-active", "");
    activeLine = line;
  };
  const print = (el: Element, at: number) => tl.set(el, { display: "block" }, at).call(follow, [], at);

  // ---- Phase 01: the window opens on a dark screen ----
  tl.call(hooks.onStage, ["boot"], 0).fromTo(
    win,
    { autoAlpha: 0, scale: 0.97, y: 10 },
    { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "power3.out" },
    0,
  );

  // ---- Phases 02–08: one command per phase, then its output ----
  terminalPhases.forEach((phase) => {
    const group = root.querySelector(`[data-phase="${phase.id}"]`)!;
    const command = group.querySelector("[data-command]")!;
    const typed = command.querySelector("[data-typed]")!;
    const promptAt = phase.promptAt ?? phase.start;
    const typing = Math.min(0.32, phase.command.length * 0.024);

    tl.call(hooks.onStage, [phase.id], phase.start);
    print(command, promptAt).call(activate, [command], promptAt);
    tl.to(typed, { text: phase.command, duration: typing, ease: "none" }, phase.start);

    let at = phase.start + typing + 0.1;
    group.querySelectorAll("[data-line]").forEach((el, i) => {
      at = Math.max(phase.lines[i].at, at);
      print(el, at);
      revealLine(tl, el, phase.lines[i], at);
      at += 0.1;
    });
  });

  // an empty prompt, cursor blinking, waiting to be let in
  const idle = q("[data-idle-prompt]")[0];
  print(idle, 11.25).call(activate, [idle], 11.25);

  // ---- Phase 09: the terminal turns to glass and the page shows through ----
  tl.call(hooks.onStage, ["transition"], REVEAL_AT)
    .call(hooks.onReveal, [], REVEAL_AT)
    .to(q("[data-skip]"), { autoAlpha: 0, duration: 0.3 }, REVEAL_AT)
    .to(q("[data-backdrop]"), { autoAlpha: 0, duration: 1.1, ease: "power2.inOut" }, REVEAL_AT)
    .to(
      win,
      {
        backgroundColor: "rgba(16, 16, 22, 0.28)",
        borderColor: "rgba(255, 255, 255, 0.22)",
        scale: 1.02,
        duration: 0.9,
      },
      REVEAL_AT,
    )
    .to(body, { autoAlpha: 0, filter: "blur(4px)", duration: 0.55, ease: "power2.in" }, REVEAL_AT + 0.2);

  // ---- Phase 10: the empty frame dissolves, the glass clears ----
  tl.to(win, { autoAlpha: 0, scale: 1.04, filter: "blur(10px)", duration: 0.75, ease: "power2.in" }, 12.4)
    .to(
      q("[data-glass]"),
      { "--glass-blur": "0px", "--glass-tint": 0, duration: 1.4, ease: "power2.inOut" },
      12.15,
    )
    // ---- Phase 11: hand the page back ----
    .call(hooks.onDone, [], 13.7);

  return tl;
}

function revealLine(tl: gsap.core.Timeline, el: Element, line: TerminalLine, at: number) {
  if (line.kind === "progress") {
    const fill = el.querySelector("[data-progress-fill]")!;
    const label = el.querySelector("[data-progress-label]")!;
    const counter = { value: 0 };
    tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, at)
      .fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: line.duration, ease: "power1.inOut" }, at)
      .to(
        counter,
        {
          value: 100,
          duration: line.duration,
          ease: "power1.inOut",
          onUpdate: () => {
            label.textContent = `${Math.round(counter.value)}%`;
          },
        },
        at,
      );
    return;
  }

  if (line.kind === "identity") {
    tl.fromTo(
      el,
      { clipPath: "inset(0 0 100% 0)" },
      { clipPath: "inset(0 0 0% 0)", duration: 0.35, ease: "power2.out" },
      at,
    ).fromTo(
      el.querySelectorAll("[data-letter], [data-tagline]"),
      { autoAlpha: 0, y: 4 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.035 },
      at + 0.15,
    );
    return;
  }

  // everything else types out left to right
  tl.fromTo(
    el,
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 0.3, ease: "steps(18)" },
    at,
  );

  if (line.kind === "check") {
    tl.fromTo(
      el.querySelector("[data-check]"),
      { scale: 0, rotation: -25 },
      { scale: 1, rotation: 0, duration: 0.35, ease: "back.out(2.4)" },
      at + 0.04,
    );
  }
}

// Leaving without the full show: "Skip intro" or Esc.
export function buildExitTimeline(root: HTMLElement, onDone: () => void) {
  const q = gsap.utils.selector(root);
  return gsap
    .timeline({ onComplete: onDone })
    .to(q("[data-skip]"), { autoAlpha: 0, duration: 0.2 }, 0)
    .to(
      q("[data-window]"),
      { autoAlpha: 0, scale: 1.02, filter: "blur(6px)", duration: 0.4, ease: "power2.in" },
      0,
    )
    .to(q("[data-backdrop]"), { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 0.1)
    .to(
      q("[data-glass]"),
      { "--glass-blur": "0px", "--glass-tint": 0, duration: 0.6, ease: "power2.inOut" },
      0.2,
    );
}

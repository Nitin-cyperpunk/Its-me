import { gsap, type Motion } from "./gsap";

// The shared scene choreography, driven entirely by data attributes so section
// markup stays server-rendered:
//
//   data-reveal="label"   the eyebrow           fades in first
//   data-word             each heading word     rises out of its mask
//   data-reveal="copy"    supporting text       fades up
//   data-reveal="item"    cards, chips, panels  blur-to-sharp, staggered
//   data-object           floating glass        glides in from data-from
//   data-depth="0.6"      any layer             scroll parallax
//   data-float="10"       any layer             slow idle bob (px)
//   data-scene-content    the text column       drifts up and dims on exit
//
// ENTER is the timeline, ACTIVE is the float (only runs while visible),
// EXIT is the scrubbed drift.

const FROM: Record<string, { x: number; y: number }> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
};

export function revealScene(root: HTMLElement, motion: Motion, options: { exit?: boolean } = {}) {
  // reduced motion: everything is already where it belongs, fully visible
  if (motion.reduced) return;

  const q = gsap.utils.selector(root);
  const travel = motion.compact ? 60 : 140;

  // ---- ENTER ----
  const enter = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: root, start: "top 70%", toggleActions: "play none none reverse" },
  });
  // not every scene has every layer; only animate what's there
  const from = (selector: string, vars: gsap.TweenVars, at: number) => {
    const targets = q(selector);
    if (targets.length) enter.from(targets, vars, at);
  };
  from('[data-reveal="label"]', { autoAlpha: 0, y: 12, duration: 0.6 }, 0);
  from("[data-word]", { yPercent: 115, duration: 1, stagger: 0.06, ease: "expo.out" }, 0.1);
  from('[data-reveal="copy"]', { autoAlpha: 0, y: 22, duration: 0.8, stagger: 0.1 }, 0.45);
  from(
    '[data-reveal="item"]',
    { autoAlpha: 0, y: 30, filter: "blur(8px)", duration: 0.9, stagger: 0.08, clearProps: "filter" },
    0.55,
  );
  gsap.utils.toArray<HTMLElement>("[data-object]", root).forEach((el, i) => {
    const dir = FROM[el.dataset.from ?? "bottom"] ?? FROM.bottom;
    enter.from(
      el,
      {
        autoAlpha: 0,
        x: dir.x * travel,
        y: dir.y * travel,
        scale: 0.8,
        rotation: motion.compact ? 0 : (i % 2 ? 12 : -12),
        duration: 1.5,
        ease: "expo.out",
      },
      0.25 + i * 0.08,
    );
  });

  // ---- ACTIVE: idle float, paused while the scene is off screen ----
  const floats = gsap.utils.toArray<HTMLElement>("[data-float]", root).map((el, i) =>
    gsap.to(el, {
      y: Number(el.dataset.float) || 10,
      rotation: i % 2 ? 2 : -2,
      duration: 3.2 + (i % 4) * 0.7,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      paused: true,
    }),
  );
  if (floats.length) {
    gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => floats.forEach((t) => (self.isActive ? t.play() : t.pause())),
      },
    });
  }

  // ---- parallax through the whole scene ----
  const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root);
  if (layers.length) {
    const strength = motion.touch || motion.compact ? 50 : 140;
    const parallax = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
    });
    layers.forEach((el) =>
      parallax.fromTo(
        el,
        { y: Number(el.dataset.depth) * strength * 0.5 },
        { y: -Number(el.dataset.depth) * strength * 0.5 },
        0,
      ),
    );
  }

  // ---- EXIT: the text drifts up and dims as the next scene arrives ----
  if (options.exit !== false && q("[data-scene-content]").length) {
    gsap.to(q("[data-scene-content]"), {
      y: -50,
      autoAlpha: 0.25,
      ease: "none",
      scrollTrigger: { trigger: root, start: "bottom 65%", end: "bottom top", scrub: true },
    });
  }
}

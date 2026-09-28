"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { footerLayers, type FooterLayer } from "./footer-layers";

gsap.registerPlugin(ScrollTrigger);

type Motion = {
  /** Multiplier on every layer's scroll parallax. */
  parallax: number;
  /** Multiplier on the continuous fog drift. */
  ambient: number;
  pointer: boolean;
  drag: boolean;
};

const MOTION: Record<"desktop" | "tablet" | "mobile", Motion> = {
  desktop: { parallax: 1, ambient: 1, pointer: true, drag: true },
  tablet: { parallax: 0.6, ambient: 0.7, pointer: false, drag: true },
  mobile: { parallax: 0.4, ambient: 0.4, pointer: false, drag: false },
};

// No match under prefers-reduced-motion, so the scene stays in its static,
// fully revealed state and the CTA is simply visible.
const QUERIES = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  tablet:
    "(min-width: 640px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 639px) and (prefers-reduced-motion: no-preference)",
  touch: "(pointer: coarse)",
};

function animateFooter(root: HTMLElement, motion: Motion, touch: boolean) {
  const q = gsap.utils.selector(root);
  const layers = footerLayers.map((layer) => ({
    ...layer,
    el: root.querySelector<HTMLElement>(`[data-layer="${layer.id}"]`)!,
  }));

  // promote to GPU layers only while motion is active (reverted with the context)
  gsap.set(
    layers.map(({ el }) => el),
    { willChange: "transform" },
  );

  // Continuous atmosphere. Paused while the footer is off screen.
  const loops = [
    gsap.to(q("[data-drift]"), {
      xPercent: 1.5 * motion.ambient,
      yPercent: -1.5 * motion.ambient,
      duration: 14,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true,
    }),
    gsap.fromTo(
      q("[data-city-glow]"),
      { opacity: 0.55 },
      { opacity: 0.8, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true },
    ),
  ];
  const playLoops = () => loops.forEach((loop) => loop.play());
  const pauseLoops = () => loops.forEach((loop) => loop.pause());

  // Scroll velocity nudges the front layers slightly, then they settle.
  const dragged = motion.drag
    ? layers
        .filter((layer) => layer.drag > 0)
        .map(({ el, drag }) => ({
          toY: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
          amount: drag,
        }))
    : [];
  const settle = gsap
    .delayedCall(0.15, () => dragged.forEach(({ toY }) => toY(0)))
    .pause();

  // The one scroll-linked timeline: 0 = footer top enters, 1 = page bottom.
  // "bottom bottom" rather than "bottom top" because the footer is the last
  // thing on the page — the viewport can never scroll past its bottom.
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top bottom",
      end: "bottom bottom",
      // Wheel scrolling is already smoothed by Lenis, so follow it directly;
      // touch scrolling is native, so give it a short catch-up instead.
      scrub: touch ? 0.5 : true,
      onEnter: playLoops,
      onEnterBack: playLoops,
      onLeave: pauseLoops,
      onLeaveBack: pauseLoops,
      onUpdate: dragged.length
        ? (self) => {
            const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 3000);
            dragged.forEach(({ toY, amount }) => toY(v * amount));
            settle.restart(true);
          }
        : undefined,
    },
  });

  layers.forEach(({ el, scale, depth, reveal: [start, end], revealFrom }) => {
    gsap.set(el, { scale });
    tl.fromTo(
      el,
      { yPercent: depth * 100 * motion.parallax, autoAlpha: revealFrom },
      { yPercent: 0, autoAlpha: 1, duration: end - start },
      start,
    );
  });

  tl.fromTo(
    q("[data-cta]"),
    { y: 80, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, ease: "power3.out", duration: 0.4 },
    0.52,
  ).fromTo(
    q("[data-cta-line]"),
    { yPercent: 105 },
    { yPercent: 0, ease: "power3.out", duration: 0.3, stagger: 0.06 },
    0.56,
  );

  // Pointer parallax: front layers travel further than back ones.
  if (!motion.pointer || touch) return () => settle.kill();

  const movers = layers
    .filter((layer) => layer.pointer > 0)
    .map(({ el, pointer }) => ({
      toX: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
      amount: pointer,
    }));
  const onPointerMove = (e: PointerEvent) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    movers.forEach(({ toX, amount }) => toX(-nx * amount));
  };
  const onPointerLeave = () => movers.forEach(({ toX }) => toX(0));
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerleave", onPointerLeave);

  return () => {
    settle.kill();
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerleave", onPointerLeave);
  };
}

function LayerImage({ layer }: { layer: FooterLayer }) {
  const drifts = layer.id === "fog";
  return (
    // Plain <img>: each layer is an absolutely positioned, GSAP-transformed
    // decoration, so next/image's wrapper and sizing would only get in the way.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={layer.src}
      width={layer.width}
      height={layer.height}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`pointer-events-none absolute top-0 h-full max-w-none object-cover select-none ${
        // the drifting fog is a touch wider so the drift never shows an edge
        drifts ? "left-[-2%] w-[104%]" : "left-0 w-full"
      } ${
        // the sky fades in from the transition gradient instead of a hard edge
        layer.id === "sky"
          ? "object-bottom [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]"
          : ""
      }`}
      data-drift={drifts || undefined}
    />
  );
}

// Stacking, back to front: landscape (sky, mountains, city + glow, fog, trees),
// then the readability overlay, then the content (children). The classes
// describe the finished composition; GSAP only adds motion, so reduced motion
// (and no JS) gets the static scene.
export default function FooterScene({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  // Layout effect so the "from" states are applied before paint — no flash of
  // the finished scene if the page is restored scrolled to the bottom.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);
    mm.add(QUERIES, (context) => {
      const { desktop, tablet, mobile, touch } = context.conditions!;
      if (!desktop && !tablet && !mobile) return; // reduced motion
      return animateFooter(
        root,
        desktop ? MOTION.desktop : tablet ? MOTION.tablet : MOTION.mobile,
        Boolean(touch),
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <footer ref={ref} className={className}>
      {/* previous section (FAQ lavender) → dusk → night: the walk into the scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[linear-gradient(to_bottom,#d3c5f7_0%,#9c83dc_7%,#4a2d8c_17%,#1a1045_30%,var(--color-night)_55%)] select-none"
      >
        {/* Landscape box with the artwork's aspect ratio, bottom-anchored so every
            layer lines up; full width so the panorama fits. On portrait screens a
            full-width band would be a thin strip, so it keeps a minimum width and is centre-cropped. */}
        <div className="absolute bottom-0 left-1/2 aspect-[2170/725] w-[max(100%,100svh)] -translate-x-1/2">
          {footerLayers.map((layer) => (
            <div
              key={layer.id}
              className="absolute inset-0 origin-bottom"
              data-layer={layer.id}
            >
              <LayerImage layer={layer} />
              {layer.id === "city" && (
                <div
                  data-city-glow
                  className="absolute inset-x-[10%] top-[45%] bottom-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_60%,rgb(255_176_92/0.28),rgb(255_150_80/0.08)_55%,transparent_75%)] opacity-65"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* readability: darkens behind the CTA and toward the bottom, keeps the lights visible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_70%_38%_at_50%_36%,rgb(7_5_26/0.42),transparent_72%),linear-gradient(to_bottom,transparent_0%,rgb(20_10_55/0.1)_50%,rgb(7_5_26/0.3)_80%,rgb(4_3_14/0.75)_100%)]"
      />

      {children}
    </footer>
  );
}

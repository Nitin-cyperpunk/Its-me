import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { heroAssets, heroMotion, type Pose } from "./hero-assets";
import { DEFAULT_MODE, heroModes, modeMotion, type HeroMode } from "./hero-modes";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

const QUERIES = {
  // one of these two always matches, so the setup always runs
  desktop: "(min-width: 1024px)",
  compact: "(max-width: 1023.98px)",
  mouse: "(hover: hover) and (pointer: fine)",
  touch: "(pointer: coarse)",
  reduce: "(prefers-reduced-motion: reduce)",
};

type Setup = {
  desktop: boolean;
  /** Entrance, idle movement, scroll exit. Off under prefers-reduced-motion. */
  animate: boolean;
  /** Parallax, hover, dragging, cursor follower: desktop layout with a mouse. */
  pointer: boolean;
  touch: boolean;
  playEntrance: boolean;
  onEntered: () => void;
  mode: { current: HeroMode };
};

// All of the hero's behaviour, driven from refs — no React state, no re-renders.
// The mode controls work everywhere (they just snap instead of glide under
// reduced motion); everything else is an enhancement on top.
export function useHeroAnimations(ref: RefObject<HTMLElement | null>) {
  // both survive a breakpoint change, which re-runs the setup
  const mode = useRef<HeroMode>(DEFAULT_MODE);
  const entered = useRef(false);

  // Layout effect so the entrance's start states are applied before paint.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);
    mm.add(QUERIES, (context) => {
      const { desktop, mouse, touch, reduce } = context.conditions!;
      return setupHero(root, {
        desktop: Boolean(desktop),
        animate: !reduce,
        pointer: Boolean(desktop && mouse && !reduce),
        touch: Boolean(touch),
        playEntrance: !reduce && !entered.current,
        onEntered: () => {
          entered.current = true;
        },
        mode,
      });
    });

    return () => mm.revert();
  }, [ref]);
}

function setupHero(root: HTMLElement, setup: Setup) {
  const q = gsap.utils.selector(root);
  const { entrance, parallax, hover, drag, idle, exit } = heroMotion;
  const background = q("[data-hero-bg]")[0];
  const cleanups: (() => void)[] = [];

  const objects = heroAssets.flatMap((config) => {
    const el = root.querySelector<HTMLElement>(`[data-object="${config.id}"]`);
    if (!el || (!setup.desktop && !config.compact)) return [];
    const layer = (name: string) => el.querySelector<HTMLElement>(`[data-${name}]`)!;
    // where CSS has put it: every mode pose is an offset from this
    const base: Pose = setup.desktop
      ? config.default
      : { ...config.default, x: config.compact!.x, y: config.compact!.y };
    return [
      {
        config,
        el,
        base,
        scroll: layer("scroll"),
        arrange: layer("arrange"),
        parallax: layer("parallax"),
        handle: layer("handle"),
        enter: layer("enter"),
        draggable: undefined as Draggable | undefined,
      },
    ];
  });
  type DeskObject = (typeof objects)[number];

  // ------------------------------------------------------------------
  // Modes: the same desk, rearranged
  // ------------------------------------------------------------------
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-mode]");

  const poseFor = ({ config, base }: DeskObject, id: HeroMode, focused: boolean): Pose => {
    if (setup.desktop) return { ...base, ...config.modes?.[id] };
    // compact: no hand-placed poses — focused things grow and lean toward the middle
    if (!focused) return base;
    const { compactPull: pull, compactAnchor: anchor, compactFocusScale } = modeMotion;
    return {
      ...base,
      x: base.x + (anchor.x - base.x) * pull,
      y: base.y + (anchor.y - base.y) * pull,
      scale: base.scale * compactFocusScale,
    };
  };

  const arrange = (id: HeroMode, animated: boolean, resetDrags: boolean) => {
    const mode = heroModes.find((m) => m.id === id)!;
    const width = root.clientWidth;
    const height = root.clientHeight;

    objects.forEach((object, i) => {
      const focused = mode.focus.includes(object.config.id);
      const pose = poseFor(object, id, focused);
      const resting = !focused && mode.dim < 1;
      const vars = {
        x: ((pose.x - object.base.x) / 100) * width,
        y: ((pose.y - object.base.y) / 100) * height,
        rotation: pose.rotation - object.base.rotation,
        scale: (pose.scale / object.base.scale) * (resting ? modeMotion.restScale : 1),
        opacity: focused ? 1 : mode.dim,
      };
      object.el.style.zIndex = String(object.config.zIndex + (focused ? modeMotion.focusZ : 0));

      if (!animated) {
        gsap.set(object.arrange, vars);
        if (resetDrags) gsap.set(object.handle, { x: 0, y: 0 });
        object.draggable?.update();
        return;
      }
      const timing = {
        duration: modeMotion.duration,
        ease: modeMotion.ease,
        delay: i * modeMotion.stagger,
        overwrite: "auto" as const,
      };
      gsap.to(object.arrange, { ...vars, ...timing });
      // anything the visitor dragged goes back to its place on the new desk
      if (resetDrags) {
        gsap.to(object.handle, {
          x: 0,
          y: 0,
          ...timing,
          onComplete: () => object.draggable?.update(),
        });
      }
    });

    buttons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.mode === id)),
    );
  };

  // put the desk in its current mode before anything is visible
  arrange(setup.mode.current, false, false);

  const onControlClick = (e: MouseEvent) => {
    const id = (e.target as Element).closest<HTMLElement>("[data-mode]")?.dataset.mode as
      | HeroMode
      | undefined;
    if (!id || id === setup.mode.current) return;
    setup.mode.current = id;
    arrange(id, setup.animate, true);
  };
  // poses are stored as px offsets, so they need recomputing when the desk resizes
  const onResize = () => arrange(setup.mode.current, false, false);
  root.addEventListener("click", onControlClick);
  window.addEventListener("resize", onResize);
  cleanups.push(() => {
    root.removeEventListener("click", onControlClick);
    window.removeEventListener("resize", onResize);
    objects.forEach(({ el, arrange: layer, handle }) => {
      gsap.killTweensOf([layer, handle]);
      gsap.set([layer, handle], { clearProps: "all" });
      el.style.zIndex = "";
      el.removeAttribute("data-lifted");
    });
  });

  const cleanup = () => cleanups.forEach((fn) => fn());
  if (!setup.animate) return cleanup;

  // ------------------------------------------------------------------
  // Idle: a few objects barely move once everything has landed
  // ------------------------------------------------------------------
  const idles = objects.flatMap(({ enter, config }, i) =>
    config.idle
      ? [
          gsap.to(enter, {
            y: config.idle.y ?? 0,
            rotation: config.idle.rotation ?? 0,
            duration: idle.duration + (i % 4) * 0.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            paused: true,
          }),
        ]
      : [],
  );
  let landed = !setup.playEntrance;
  let inView = true;
  const syncIdle = () => idles.forEach((tween) => (landed && inView ? tween.play() : tween.pause()));

  // ------------------------------------------------------------------
  // Entrance: the desk is built up piece by piece
  // ------------------------------------------------------------------
  if (setup.playEntrance) {
    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        landed = true;
        syncIdle();
        setup.onEntered();
      },
    });

    tl.fromTo(background, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, 0)
      .fromTo(
        q("[data-hero-name]"),
        { autoAlpha: 0, y: 26, rotation: -3 },
        { autoAlpha: 1, y: 0, rotation: 0, duration: 1.1, ease: "expo.out" },
        entrance.name,
      )
      .fromTo(
        q("[data-hero-fade]"),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 },
        entrance.text,
      )
      .fromTo(
        q("[data-hero-control]"),
        { autoAlpha: 0, y: 14, scale: 0.8 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.07 },
        entrance.controls,
      )
      .fromTo(
        q("[data-hero-decor]"),
        { autoAlpha: 0, scale: 0.8 },
        { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1 },
        entrance.decor,
      );

    const seen: Record<string, number> = {};
    objects.forEach(({ config, enter }) => {
      const group = entrance.groups[config.group];
      const index = (seen[config.group] = (seen[config.group] ?? -1) + 1);
      tl.fromTo(
        enter,
        {
          autoAlpha: 0,
          y: entrance.rise,
          scale: entrance.scale,
          rotation: gsap.utils.random(-entrance.tilt, entrance.tilt),
        },
        { autoAlpha: 1, y: 0, scale: 1, rotation: 0, duration: group.duration, ease: group.ease },
        group.at + index * entrance.stagger,
      );
    });
  }
  // start states are in place, so the CSS guard can let go
  root.classList.add("is-ready");
  syncIdle();

  // ------------------------------------------------------------------
  // Leaving the hero: the desk drifts apart and falls behind
  // ------------------------------------------------------------------
  const leave = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom top",
      // Wheel scrolling is already smoothed by Lenis; touch scrolling is native.
      scrub: setup.touch ? 0.5 : true,
      onToggle: (self) => {
        inView = self.isActive || self.progress === 0;
        syncIdle();
      },
    },
  });
  const spread = setup.desktop ? exit.spread : exit.spread * 0.4;
  leave
    .to(background, { yPercent: exit.background, scale: exit.backgroundScale }, 0)
    .to(q("[data-hero-text]"), { y: () => -window.innerHeight * exit.text, opacity: 0.15 }, 0);
  objects.forEach(({ config, scroll, base }) => {
    const side = base.x < 50 ? -1 : 1;
    leave.to(
      scroll,
      {
        y: -exit.travel * config.depth,
        x: ((base.x - 50) / 50) * spread,
        rotation: side * exit.rotate * config.depth,
        opacity: exit.fade,
      },
      0,
    );
  });

  if (!setup.pointer) return cleanup;

  // ------------------------------------------------------------------
  // Pointer parallax + cursor follower: one listener for both
  // ------------------------------------------------------------------
  const quick = (el: Element, prop: string, duration: number) =>
    gsap.quickTo(el, prop, { duration, ease: "power3.out" });

  const movers = [
    { el: background as Element, depth: parallax.background },
    ...objects.map((object) => ({ el: object.parallax, depth: object.config.depth })),
  ].map(({ el, depth }) => ({
    toX: quick(el, "x", 0.9),
    toY: quick(el, "y", 0.9),
    amount: depth * parallax.strength,
  }));

  const cursor = q("[data-hero-cursor]")[0];
  const REST = 0.35; // a small dot until it's over something it can pick up
  gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: REST });
  const cursorX = quick(cursor, "x", 0.25);
  const cursorY = quick(cursor, "y", 0.25);
  let over = false;
  let dragging = false;
  const syncCursor = () => {
    cursor.toggleAttribute("data-over", over || dragging);
    gsap.to(cursor, {
      scale: dragging ? 0.7 : over ? 1 : REST,
      duration: 0.3,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    movers.forEach(({ toX, toY, amount }) => {
      toX(-nx * amount);
      toY(-ny * amount);
    });
    cursorX(e.clientX);
    cursorY(e.clientY);
  };
  const onPointerEnter = () => gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
  const onPointerLeave = () => {
    movers.forEach(({ toX, toY }) => {
      toX(0);
      toY(0);
    });
    gsap.to(cursor, { autoAlpha: 0, duration: 0.3 });
  };
  const onPointerOver = (e: PointerEvent) => {
    const next = Boolean((e.target as Element).closest("[data-handle]"));
    if (next === over) return;
    over = next;
    syncCursor();
  };
  root.addEventListener("pointermove", onPointerMove);
  root.addEventListener("pointerenter", onPointerEnter);
  root.addEventListener("pointerleave", onPointerLeave);
  root.addEventListener("pointerover", onPointerOver);
  cleanups.push(() => {
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerenter", onPointerEnter);
    root.removeEventListener("pointerleave", onPointerLeave);
    root.removeEventListener("pointerover", onPointerOver);
    cursor.removeAttribute("data-over");
  });

  // ------------------------------------------------------------------
  // Hover + drag: both live on the handle, so one function decides its pose
  // ------------------------------------------------------------------
  // dragged things go above everything, including whatever the mode brought forward
  let topZ = Math.max(...heroAssets.map((asset) => asset.zIndex)) + modeMotion.focusZ;

  objects.forEach((object) => {
    const { config, el, handle } = object;
    const state = { hover: false, drag: false };
    const pose = () => {
      const lifted = state.hover || state.drag;
      el.toggleAttribute("data-lifted", lifted);
      gsap.to(handle, {
        scale: state.drag ? drag.scale : state.hover ? hover.scale : 1,
        rotation: lifted ? hover.rotate : 0,
        duration: 0.5,
        ease: lifted ? "power3.out" : "back.out(1.7)",
        overwrite: "auto",
      });
    };

    const onEnter = () => {
      state.hover = true;
      pose();
    };
    const onLeave = () => {
      state.hover = false;
      pose();
    };
    handle.addEventListener("pointerenter", onEnter);
    handle.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      handle.removeEventListener("pointerenter", onEnter);
      handle.removeEventListener("pointerleave", onLeave);
    });

    if (!config.draggable) return;
    const [draggable] = Draggable.create(handle, {
      type: "x,y",
      bounds: root,
      inertia: true,
      edgeResistance: 0.8,
      maxDuration: 0.8,
      // stacking is decided on the outer element, which owns the z-index
      zIndexBoost: false,
      allowContextMenu: true,
      onPress() {
        el.style.zIndex = String(++topZ); // stays on top, like the last thing you put down
        state.drag = dragging = true;
        pose();
        syncCursor();
      },
      onRelease() {
        state.drag = dragging = false;
        pose();
        syncCursor();
      },
    });
    object.draggable = draggable;
    // runs before the shared reset above clears the handle's inline styles
    cleanups.unshift(() => draggable.kill());
  });

  return cleanup;
}

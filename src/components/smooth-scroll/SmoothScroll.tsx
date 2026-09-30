"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { intro } from "@/lib/intro";

gsap.registerPlugin(ScrollTrigger);
// Mobile browsers resize the viewport when the address bar shows/hides;
// recalculating every trigger then causes a visible jump mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

// The app's single Lenis instance. Rendered once from the root layout;
// components never create their own — ScrollTrigger reads the native scroll
// position, so everything stays in sync through the update hook below.
export default function SmoothScroll() {
  useEffect(() => {
    // smooth scrolling is an enhancement: skip it entirely for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // GSAP's ticker drives Lenis so both advance on the same frame
    const lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // paused while the terminal intro covers the page
    const syncWithIntro = () => (intro.locksScroll() ? lenis.stop() : lenis.start());
    syncWithIntro();
    const stopListening = intro.subscribe(syncWithIntro);

    return () => {
      stopListening();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      lenis.destroy();
    };
  }, []);

  return null;
}

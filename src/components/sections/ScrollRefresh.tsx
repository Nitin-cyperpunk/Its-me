"use client";

import { useScrollRefresh } from "@/lib/animations/scroll";

// Re-measures every ScrollTrigger once fonts, images and the intro have settled.
export default function ScrollRefresh() {
  useScrollRefresh();
  return null;
}

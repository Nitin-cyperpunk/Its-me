"use client";

import { useSyncExternalStore } from "react";
import { formatSiteDateTime } from "@/lib/format";

// Poll a few times a second so the display flips close to the real second;
// React only re-renders when the second actually changes.
const subscribe = (onChange: () => void) => {
  const id = window.setInterval(onChange, 250);
  return () => window.clearInterval(id);
};
const currentSecond = () => Math.floor(Date.now() / 1000);
// The server's time never matches the browser's, so the server renders
// nothing and the clock appears on hydration — no mismatch.
const serverSecond = () => null;

export default function LiveClock() {
  const second = useSyncExternalStore(subscribe, currentSecond, serverSecond);
  if (second === null) return null;

  const now = new Date(second * 1000);
  return <time dateTime={now.toISOString()}>{formatSiteDateTime(now)}</time>;
}

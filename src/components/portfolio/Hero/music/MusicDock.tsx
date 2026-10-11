"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { close, registerHost, useMusic } from "./youtube-player";
import styles from "./music-player.module.css";

const noop = () => () => {};

// The actual YouTube player, docked in a corner once the visitor presses Play.
// YouTube requires embedded players to stay visible and at least 200×200 px —
// far bigger than the card on the desk — so the card is the remote and this is
// the player. It's portaled to <body> (the hero's transformed wrappers would
// otherwise trap position: fixed) and stays put while the page scrolls, so the
// music carries on through the other sections. Closing it stops playback.
export default function MusicDock() {
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  if (!isClient) return null;
  return createPortal(<Dock />, document.body);
}

function Dock() {
  const { docked, status, track, message } = useMusic();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hostRef.current) registerHost(hostRef.current);
  }, []);

  return (
    <section className={styles.dock} data-open={docked || undefined} aria-label="YouTube player" inert={!docked}>
      <header className={styles.dockBar}>
        <span className={styles.dockTitle}>
          {status === "loading" ? "Loading YouTube…" : (track?.title ?? "YouTube")}
        </span>
        <button type="button" className={styles.dockClose} onClick={close} aria-label="Stop and close the player">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </header>
      {status === "blocked" && message && <p className={styles.dockHint}>{message}</p>}
      {/* the IFrame API replaces a child of this with the player iframe */}
      <div ref={hostRef} className={styles.dockFrame} />
    </section>
  );
}

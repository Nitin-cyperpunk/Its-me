"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import MusicDock from "./music/MusicDock";
import {
  next,
  previous,
  seek,
  thumbnail,
  toggle,
  useMusic,
  useMusicTime,
  type MusicStatus,
} from "./music/youtube-player";
import styles from "./music/music-player.module.css";

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const s = Math.floor(seconds);
  const [h, m, sec] = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60];
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(sec).padStart(2, "0")}`;
};

// The progress bar and times re-render four times a second while playing,
// so they subscribe to the clock on their own and the rest of the card doesn't.
function Progress({ active }: { active: boolean }) {
  const { current, duration } = useMusicTime();
  const ready = active && duration > 0;
  return (
    <div className={styles.progress} data-no-drag>
      <input
        type="range"
        className={styles.range}
        min={0}
        max={ready ? Math.floor(duration) : 1}
        step={1}
        value={ready ? Math.min(Math.floor(current), Math.floor(duration)) : 0}
        onChange={(e) => seek(Number(e.target.value))}
        disabled={!ready}
        aria-label="Seek"
        aria-valuetext={ready ? `${clock(current)} of ${clock(duration)}` : "Not playing"}
        style={{ "--p": ready ? `${(current / duration) * 100}%` : "0%" } as CSSProperties}
      />
      <span className={styles.times} aria-hidden="true">
        <span>{ready ? clock(current) : "0:00"}</span>
        <span>{ready ? clock(duration) : "--:--"}</span>
      </span>
    </div>
  );
}

const playing = (status: MusicStatus) => status === "playing";
const busy = (status: MusicStatus) => status === "loading" || status === "buffering";

// The music player on the desk: drawn instantly, no YouTube until the visitor
// presses play (music/youtube-player.ts). Dragging works from anywhere except
// the controls, which are marked data-no-drag (see useHeroAnimations).
export default function MusicPlayer({
  className,
  style,
  children,
}: {
  className: string;
  style: CSSProperties;
  /** The handwritten caption that travels with the object. */
  children?: ReactNode;
}) {
  const music = useMusic();
  const { configured, status, track, index, count, message } = music;

  useEffect(() => {
    if (!configured && process.env.NODE_ENV === "development") {
      console.warn("[music] No playlist set — paste one into MUSIC_CONFIG.playlistId in src/config/music.ts.");
    }
  }, [configured]);

  // buffering mid-track still counts as playing: the button offers Pause
  const isPlaying = status === "playing" || status === "buffering";
  const problem = status === "error" || status === "blocked";

  // only real metadata, or an honest state — never a made-up track
  const title = !configured
    ? "Nothing queued"
    : track?.title
      ? track.title
      : problem
        ? "Can't play right now"
        : status === "idle" || status === "paused"
          ? "Press play"
          : "Loading…";
  const subtitle = track
    ? track.author || (count > 0 ? `Track ${index + 1} of ${count}` : "")
    : configured
      ? "My YouTube playlist"
      : "Playlist coming soon";

  return (
    <div className={`${className} ${styles.player}`} style={style} data-status={status} data-configured={configured || undefined}>
      <div className={styles.card} role="group" aria-label="Music player">
        <div className={styles.top}>
          <div className={styles.meta}>
            <span className={styles.eq} data-active={playing(status) || undefined} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className={styles.title} title={track?.title || undefined}>
              {title}
            </span>
            <span className={styles.subtitle}>{subtitle}</span>
          </div>

          <span className={styles.art} aria-hidden="true">
            {track ? (
              // keyed by video, so each new track's artwork fades in over the last
              // eslint-disable-next-line @next/next/no-img-element
              <img key={track.videoId} src={thumbnail(track.videoId)} alt="" draggable={false} decoding="async" />
            ) : (
              <span className={styles.artFallback}>
                <i />
              </span>
            )}
          </span>
        </div>

        {problem && message && <p className={styles.notice}>{message}</p>}

        <Progress active={Boolean(track)} />

        <div className={styles.controls} data-no-drag>
          <button type="button" className={styles.button} onClick={previous} disabled={!configured} aria-label="Previous track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 5v14M18 5.5v13L9 12z" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.play}`}
            onClick={toggle}
            disabled={!configured}
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-busy={busy(status) || undefined}
          >
            {status === "loading" ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13L19 12z" />
              </svg>
            )}
          </button>
          <button type="button" className={styles.button} onClick={next} disabled={!configured} aria-label="Next track">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 5v14M6 5.5v13L15 12z" />
            </svg>
          </button>
        </div>

        <p className={styles.srOnly} role="status">
          {message ?? (track?.title && playing(status) ? `Now playing: ${track.title}` : "")}
        </p>
      </div>
      {children}
      {configured && <MusicDock />}
    </div>
  );
}

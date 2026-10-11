// The one YouTube player behind the desk's music card.
//
// It lives at module level, outside React: the IFrame API script is injected
// once, on the first deliberate Play, and the same player instance is reused
// for everything after — re-renders, mode changes and scrolling never touch it.
// Components read it through useSyncExternalStore (see useMusic below).

import { useSyncExternalStore } from "react";
import { playlistId } from "@/config/music";

// ---- The slice of the IFrame API we use (https://developers.google.com/youtube/iframe_api_reference) ----
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getPlaylist(): string[] | null;
  getPlaylistIndex(): number;
  getVideoData?(): { video_id?: string; title?: string; author?: string };
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      host?: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    },
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

export type Track = { videoId: string; title: string; author: string };
export type MusicStatus =
  | "idle" // nothing loaded yet
  | "loading" // fetching the API / creating the player
  | "buffering"
  | "playing"
  | "paused"
  | "blocked" // the browser wouldn't start audio without a tap on the video itself
  | "error";

export type MusicState = {
  configured: boolean;
  status: MusicStatus;
  track: Track | null;
  index: number;
  count: number;
  /** Short, honest feedback for the card's live region. */
  message: string | null;
  /** The docked YouTube player is on screen. */
  docked: boolean;
};

export type MusicTime = { current: number; duration: number };

// ---- tiny external store (two of them, so the clock never re-renders the whole card) ----
function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(patch: Partial<T>) {
      value = { ...value, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

const initialState: MusicState = {
  configured: playlistId !== null,
  status: "idle",
  track: null,
  index: -1,
  count: 0,
  message: null,
  docked: false,
};
const state = createStore<MusicState>(initialState);
const time = createStore<MusicTime>({ current: 0, duration: 0 });

export const useMusic = () => useSyncExternalStore(state.subscribe, state.get, () => initialState);
const initialTime: MusicTime = { current: 0, duration: 0 };
export const useMusicTime = () => useSyncExternalStore(time.subscribe, time.get, () => initialTime);

// ---- API script: injected once, retried only after a failure ----
let apiPromise: Promise<YTNamespace> | null = null;

function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      script.remove();
      apiPromise = null; // allow a retry
      reject(new Error("YouTube API failed to load"));
    };
    document.head.appendChild(script);
    // a script that loads but never calls back (blocked by an extension, flaky network)
    setTimeout(() => {
      if (window.YT?.Player) return;
      apiPromise = null;
      reject(new Error("YouTube API timed out"));
    }, 15000);
  });
  return apiPromise;
}

// ---- the player ----
let host: HTMLElement | null = null;
let player: YTPlayer | null = null;
let creating = false;
let wantsPlay = false;
let clock: ReturnType<typeof setInterval> | null = null;
let watchdog: ReturnType<typeof setTimeout> | null = null;
let consecutiveErrors = 0;

/** The docked panel hands over the element the iframe will live in (once). */
export function registerHost(el: HTMLElement) {
  host = el;
}

export const thumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

function readTrack() {
  if (!player) return;
  const data = player.getVideoData?.() ?? {};
  const list = player.getPlaylist() ?? [];
  const index = player.getPlaylistIndex();
  const videoId = data.video_id || list[index] || "";
  state.set({
    index,
    count: list.length,
    // only real metadata: if YouTube hasn't told us the title yet, there is none
    track: videoId ? { videoId, title: data.title?.trim() || "", author: data.author?.trim() || "" } : null,
  });
}

function tick() {
  if (!player) return;
  time.set({ current: player.getCurrentTime() || 0, duration: player.getDuration() || 0 });
}

function setClock(running: boolean) {
  if (running && !clock) clock = setInterval(tick, 250);
  if (!running && clock) {
    clearInterval(clock);
    clock = null;
  }
  tick();
}

function clearWatchdog() {
  if (watchdog) clearTimeout(watchdog);
  watchdog = null;
}

// After asking for playback: if nothing has started a few seconds later, say why.
function armWatchdog() {
  clearWatchdog();
  watchdog = setTimeout(() => {
    if (!player) return;
    const s = player.getPlayerState();
    if (s === STATE.PLAYING || s === STATE.BUFFERING) return;
    if (!player.getPlaylist()?.length) {
      state.set({
        status: "error",
        message: "Couldn't load the playlist — is it Public or Unlisted?",
      });
    } else {
      // typically iOS / strict autoplay settings: audio needs a tap on the player itself
      state.set({ status: "blocked", message: "Tap play on the YouTube player to start the sound." });
    }
  }, 6000);
}

function onStateChange(code: number) {
  readTrack();
  switch (code) {
    case STATE.PLAYING:
      consecutiveErrors = 0;
      clearWatchdog();
      state.set({ status: "playing", message: null });
      setClock(true);
      break;
    case STATE.BUFFERING:
      state.set({ status: "buffering", message: null });
      setClock(true);
      break;
    case STATE.PAUSED:
      state.set({ status: "paused" });
      setClock(false);
      break;
    case STATE.ENDED:
      // the end of the playlist
      state.set({ status: "paused", message: null });
      setClock(false);
      break;
    default:
      setClock(false);
  }
}

function onError(code: number) {
  consecutiveErrors += 1;
  const count = state.get().count;
  // 2: bad request (e.g. a malformed playlist), before anything has played
  if (code === 2 && !state.get().track) {
    clearWatchdog();
    state.set({ status: "error", message: "This playlist couldn't be loaded. Check the playlist ID." });
    return;
  }
  // 5 / 100 / 101 / 150: this one video can't play here (removed, private, embedding off)
  if (consecutiveErrors >= Math.max(3, Math.min(count, 10))) {
    clearWatchdog();
    state.set({ status: "error", message: "None of these videos can play here right now." });
    return;
  }
  state.set({ status: "buffering", message: "That one can't play here — skipping to the next." });
  setTimeout(() => {
    player?.nextVideo();
    armWatchdog();
  }, 1200);
}

async function create() {
  if (creating || player || !host || !playlistId) return;
  creating = true;
  state.set({ status: "loading", message: "Loading YouTube…", docked: true });
  try {
    const YT = await loadApi();
    const target = document.createElement("div");
    host.replaceChildren(target);
    await new Promise<void>((resolve) => {
      player = new YT.Player(target, {
        // privacy-enhanced mode: no YouTube cookies until the visitor plays
        host: "https://www.youtube-nocookie.com",
        width: "100%",
        height: "100%",
        playerVars: {
          listType: "playlist",
          list: playlistId!,
          // only ever reached through a click on Play
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => resolve(),
          onStateChange: (e) => onStateChange(e.data),
          onError: (e) => onError(e.data),
        },
      });
    });
    readTrack();
    if (wantsPlay) {
      player!.playVideo();
      armWatchdog();
    } else {
      // paused while YouTube was still loading: stay ready, don't start
      state.set({ status: "paused", message: null });
    }
  } catch {
    player = null;
    host?.replaceChildren();
    state.set({ status: "error", message: "Couldn't reach YouTube. Try again in a moment.", docked: false });
  } finally {
    creating = false;
  }
}

// ---- controls (all no-ops until there's a playlist) ----

export function play() {
  if (!playlistId) return;
  wantsPlay = true;
  if (!player) {
    void create();
    return;
  }
  state.set({ docked: true, message: null });
  if (state.get().status !== "playing") state.set({ status: "buffering" });
  player.playVideo();
  armWatchdog();
}

export function pause() {
  wantsPlay = false;
  clearWatchdog();
  player?.pauseVideo();
}

export function toggle() {
  const { status } = state.get();
  if (status === "playing" || status === "buffering" || status === "loading") pause();
  else play();
}

export function next() {
  if (!player) return play();
  wantsPlay = true;
  player.nextVideo();
  armWatchdog();
}

export function previous() {
  if (!player) return play();
  wantsPlay = true;
  // like any player: a few seconds in, "previous" restarts the current track
  if (player.getCurrentTime() > 3) player.seekTo(0, true);
  else player.previousVideo();
  armWatchdog();
}

export function seek(seconds: number) {
  if (!player) return;
  player.seekTo(seconds, true);
  time.set({ current: seconds });
}

/** Closing the docked player stops playback — the player is never left playing out of sight. */
export function close() {
  pause();
  state.set({ docked: false, message: null });
}

// The hero's music player (the card on the desk) plays this YouTube playlist.
//
// Paste either the playlist ID or the whole playlist URL, e.g.
//   playlistId: "PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//   playlistId: "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
// The playlist must be Public or Unlisted (Private ones can't be embedded), and
// videos whose owners disabled embedding are skipped automatically.
// Left empty, the card shows as an inactive player.

export const MUSIC_CONFIG = {
  playlistId: "",
};

// Accepts an ID or any YouTube/YouTube Music URL with a list= parameter.
export function resolvePlaylistId(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  let id = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      id = new URL(raw).searchParams.get("list") ?? "";
    } catch {
      return null;
    }
  }
  return /^[A-Za-z0-9_-]{10,}$/.test(id) ? id : null;
}

export const playlistId = resolvePlaylistId(MUSIC_CONFIG.playlistId);

import type { CSSProperties, ReactNode } from "react";
import { heroMusic } from "./hero-assets";

// Visual only for now. Once heroMusic.url is set the player links out to it;
// real playback (an embed, the Web Playback SDK…) can replace this wrapper
// without touching the scene.
export default function MusicPlayer({
  className,
  style,
  children,
}: {
  className: string;
  style: CSSProperties;
  /** The player artwork. */
  children: ReactNode;
}) {
  if (!heroMusic.url) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={heroMusic.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}

import type { CSSProperties } from "react";
import Image from "next/image";
import type { HeroAsset } from "./hero-assets";
import MusicPlayer from "./MusicPlayer";
import ProjectCard from "./ProjectCard";
import styles from "./hero.module.css";

// One thing on the desk. Each wrapper carries exactly one kind of motion so
// they never fight over the same transform:
//   object        default position + stacking (CSS only)
//   data-scroll   leaving the hero
//   data-arrange  the pose for the current mode
//   data-parallax pointer parallax
//   data-handle   drag + hover
//   data-enter    entrance + idle movement
//   content       resting rotation/scale + shadow (CSS only)
export default function InteractiveAsset({ asset }: { asset: HeroAsset }) {
  const { compact } = asset;

  const position = {
    "--x": asset.default.x,
    "--y": asset.default.y,
    "--w": asset.width,
    "--cx": compact?.x,
    "--cy": compact?.y,
    "--cw": compact?.width,
    "--z": asset.zIndex,
  } as CSSProperties;

  const contentClass = `${styles.content} ${asset.fix ? styles[asset.fix] : ""}`;
  const contentStyle = {
    "--r": asset.default.rotation,
    "--s": asset.default.scale,
  } as CSSProperties;

  const caption = asset.caption && (
    <span className={styles.caption} aria-hidden="true">
      {asset.caption}
    </span>
  );

  const image = asset.kind !== "project" && (
    <Image
      src={asset.src}
      width={asset.intrinsic[0]}
      height={asset.intrinsic[1]}
      alt={asset.alt}
      sizes={`(min-width: 1024px) ${Math.ceil(asset.width * 1.5)}vw, ${compact?.width ?? asset.width}vw`}
      loading={asset.eager ? "eager" : "lazy"}
      draggable={false}
    />
  );

  return (
    <div
      className={`${styles.object} ${compact ? "" : styles.compactHidden}`}
      style={position}
      data-object={asset.id}
    >
      <div data-scroll>
        <div data-arrange>
          <div data-parallax>
            <div data-handle>
              <div data-enter>
                {asset.kind === "project" ? (
                  <ProjectCard project={asset} className={contentClass} style={contentStyle}>
                    {caption}
                  </ProjectCard>
                ) : asset.kind === "music" ? (
                  <MusicPlayer className={contentClass} style={contentStyle}>
                    {image}
                    {caption}
                  </MusicPlayer>
                ) : (
                  <div className={contentClass} style={contentStyle}>
                    {image}
                    {caption}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

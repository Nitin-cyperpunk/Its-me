import { Caveat } from "next/font/google";
import Image from "next/image";
import { heroAssets, heroBackground } from "./hero-assets";
import HeroScene from "./HeroScene";
import HeroText from "./HeroText";
import InteractiveAsset from "./InteractiveAsset";
import styles from "./hero.module.css";

// A handwritten signature for the name and notes; everything else uses the
// site's type system (globals.css): personal notebook + developer workspace.
const script = Caveat({
  weight: "700",
  subsets: ["latin"],
  variable: "--hero-font-script",
});

const Star = ({ x, y, rotate }: { x: string; y: string; rotate: number }) => (
  <svg
    className={styles.star}
    style={{ left: x, top: y, rotate: `${rotate}deg` }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
    data-hero-decor
    data-enter
  >
    <path d="M12 3v18M4 8l16 8M4 16l16-8" />
  </svg>
);

// Back to front: the desk texture, a wash of clean paper behind the words,
// the objects (each an independent element), and the words on top.
// Content is server-rendered; only HeroScene ships JS.
export default function Hero() {
  return (
    <HeroScene className={`${script.variable} ${styles.hero}`}>
      <div className={styles.bg} data-hero-bg data-enter aria-hidden="true">
        <Image src={heroBackground.src} alt="" fill preload sizes="100vw" draggable={false} />
      </div>
      <div className={styles.wash} aria-hidden="true" />

      <Star x="66%" y="29%" rotate={12} />
      <Star x="32.5%" y="71%" rotate={-8} />

      {heroAssets.map((asset) => (
        <InteractiveAsset key={asset.id} asset={asset} />
      ))}

      <HeroText />

      <div className={styles.cursor} data-hero-cursor aria-hidden="true" />
    </HeroScene>
  );
}

import type { ComponentPropsWithoutRef, ElementType } from "react";
import styles from "@/components/sections/scenes.module.css";

type GlassCardProps<T extends ElementType> = {
  as?: T;
  tone?: "clear" | "blue";
} & ComponentPropsWithoutRef<T>;

// A translucent panel: white glass in light mode, royal-blue glass in dark.
export default function GlassCard<T extends ElementType = "div">({
  as,
  tone = "clear",
  className = "",
  ...props
}: GlassCardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      className={`${styles.glass} ${tone === "blue" ? styles.glassBlue : ""} ${className}`}
      {...props}
    />
  );
}

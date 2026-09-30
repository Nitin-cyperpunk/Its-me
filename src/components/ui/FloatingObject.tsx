import styles from "@/components/sections/scenes.module.css";

export type Shape = "sphere" | "ring" | "pill" | "prism" | "ribbon";

// A decorative glass shape. Three nested layers so the shared scene motion
// never fights over one transform: entrance (data-object) → parallax
// (data-depth) → idle float (data-float). Size and position come from className.
export default function FloatingObject({
  shape,
  className,
  from = "bottom",
  depth = 0.4,
  float = 12,
  desktopOnly = false,
}: {
  shape: Shape;
  className: string;
  from?: "left" | "right" | "top" | "bottom";
  depth?: number;
  float?: number;
  desktopOnly?: boolean;
}) {
  return (
    <div
      className={`${styles.object} ${desktopOnly ? styles.desktopOnly : ""} ${className}`}
      data-object
      data-from={from}
      aria-hidden="true"
    >
      <div data-depth={depth}>
        <div data-float={float}>
          <div className={`${styles.shape} ${styles[shape]}`} />
        </div>
      </div>
    </div>
  );
}

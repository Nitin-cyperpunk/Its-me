import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// Default social share image, generated at build time.
// To use a custom image instead, delete this file and add
// `opengraph-image.png` (1200x630) to this folder.

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#171717",
          fontSize: 72,
        }}
      >
        {siteConfig.name}
      </div>
    ),
    size,
  );
}

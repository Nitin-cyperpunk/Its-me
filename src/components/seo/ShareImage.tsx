import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// The social share card behind both opengraph-image and twitter-image.
export const shareImageSize = { width: 1200, height: 630 };

export function renderShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          // the hero's cream desk and ink
          background: "#f7f3ea",
          color: "#2a2521",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 40, color: "#5b4bc4" }}>{siteConfig.jobTitle}</div>
        <div style={{ marginTop: 24, fontSize: 28, color: "rgba(42, 37, 33, 0.6)" }}>
          {new URL(siteConfig.url).host}
        </div>
      </div>
    ),
    shareImageSize,
  );
}

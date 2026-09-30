import { renderShareImage } from "@/components/seo/ShareImage";

// Default social share image, generated at build time (design in
// components/seo/ShareImage.tsx). To use a custom image instead, delete this
// file and twitter-image.tsx, and add opengraph-image.png + twitter-image.png
// (1200x630) to this folder.

export const alt = "Nitin Singh — AI Full-Stack Developer & Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderShareImage();
}

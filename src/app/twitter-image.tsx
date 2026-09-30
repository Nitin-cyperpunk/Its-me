import { renderShareImage } from "@/components/seo/ShareImage";

// Same card as opengraph-image.tsx, so X gets an explicit twitter:image.
export const alt = "Nitin Singh — AI Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderShareImage();
}

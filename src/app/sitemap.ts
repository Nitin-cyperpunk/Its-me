import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// The site has one public route today. Add an entry here for each new page
// (sections on the home page, like a future #projects, don't get entries).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

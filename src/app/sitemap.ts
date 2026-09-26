import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Add an entry here for each new page you create.
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

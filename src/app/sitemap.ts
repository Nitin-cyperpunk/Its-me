import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

type Route = {
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
};

// Every public page, and only those. About, education, experience, projects
// and contact are sections of the home page today, so they have no entries —
// when one becomes its own page (e.g. src/app/projects/page.tsx), add
// { path: "/projects" } here. Never list API, draft, private or query-string URLs.
const routes: Route[] = [{ path: "/", changeFrequency: "monthly", priority: 1 }];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteConfig.url).href,
    lastModified,
    changeFrequency,
    priority,
  }));
}

// Central SEO / site configuration.

export const siteConfig = {
  // The one canonical origin: metadataBase, canonical, Open Graph, sitemap,
  // robots and JSON-LD all derive from it. Hardcoded rather than read from an
  // env var so a preview deployment (*.vercel.app) or a www alias can never
  // leak into canonical URLs.
  url: "https://nitinverse.me",

  name: "Nitin Singh",
  title: "Nitin Singh — AI Full-Stack Developer & Software Engineer",
  description:
    "Nitin Singh is an AI Full-Stack Developer and Software Engineer building web and mobile products, AI-powered applications, automation workflows, and SaaS products.",
  // Link previews (Open Graph / X) already show the name as the title.
  shareDescription:
    "AI Full-Stack Developer building web, mobile, AI, automation, and SaaS products.",
  // Primary positioning first; the rest are how the same work is also described.
  jobTitle: "AI Full-Stack Developer",
  altJobTitles: ["AI Software Engineer", "Full-Stack Developer"],
  keywords: [
    "Nitin Singh",
    "AI Full-Stack Developer",
    "AI Software Engineer",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Supabase",
    "n8n",
    "AI applications",
    "SaaS",
  ],
  // Topics backed by the page's own content — used as Person.knowsAbout.
  knowsAbout: [
    "Web development",
    "Mobile development",
    "AI-powered applications",
    "Large language models",
    "Automation",
    "SaaS",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Supabase",
    "n8n",
  ],
  locale: "en_IN",
  // Timezone for the footer's live clock — always shown in this zone, not the visitor's.
  timeZone: "Asia/Kolkata",

  email: "hello@example.com", // PLACEHOLDER: your contact email (footer links) — see contactEmail below

  // Public profile URLs (footer links, GitHub section, JSON-LD "sameAs").
  // The GitHub login is verified against the GitHub API (name, blog → this site).
  socials: [
    "https://github.com/Nitin-cyperpunk",
    "https://www.linkedin.com/in/itsnitinsingh66/",
  ],
};

// Profiles safe to publish as structured data: the placeholders above are
// filtered out, so real URLs start appearing in "sameAs" as soon as they're filled in.
export const publicProfiles = siteConfig.socials.filter(
  (url) => !url.includes("your-username"),
);

// The address to show as a mailto link, or null while it's still the
// placeholder — so no fake address is ever published.
export const contactEmail = siteConfig.email.endsWith("@example.com") ? null : siteConfig.email;

export const findProfile = (host: string) =>
  publicProfiles.find((url) => new URL(url).hostname.endsWith(host)) ?? null;

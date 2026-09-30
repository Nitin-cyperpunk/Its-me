// Central SEO / site configuration.

export const siteConfig = {
  // The one canonical origin: metadataBase, canonical, Open Graph, sitemap,
  // robots and JSON-LD all derive from it. Hardcoded rather than read from an
  // env var so a preview deployment (*.vercel.app) or a www alias can never
  // leak into canonical URLs.
  url: "https://nitinverse.me",

  name: "Nitin Singh",
  title: "Nitin Singh — Full Stack Developer",
  description:
    "Nitin Singh is a Full Stack Developer building web products, AI experiments, and automation systems.",
  // Link previews (Open Graph / X) already show the name as the title.
  shareDescription:
    "Full Stack Developer building web products, AI experiments, and automation systems.",
  jobTitle: "Full Stack Developer",
  keywords: [
    "Nitin Singh",
    "Full Stack Developer",
    "web development",
    "mobile development",
    "SaaS",
    "AI",
    "automation",
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Supabase",
    "PostgreSQL",
    "n8n",
  ],
  locale: "en_US",
  // Timezone for the footer's live clock — always shown in this zone, not the visitor's.
  timeZone: "Asia/Kolkata",

  email: "hello@example.com", // PLACEHOLDER: your contact email (footer CTA)

  // PLACEHOLDER: your public profile URLs (footer buttons, and JSON-LD "sameAs"
  // once they're real — see publicProfiles below).
  socials: [
    "https://github.com/nitin-cyperpunk",
    "https://www.https://www.linkedin.com/in/itsnitinsingh66/",
  ],
};

// Profiles safe to publish as structured data: the placeholders above are
// filtered out, so real URLs start appearing in "sameAs" as soon as they're filled in.
export const publicProfiles = siteConfig.socials.filter(
  (url) => !url.includes("your-username"),
);

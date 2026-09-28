// Central SEO / site configuration.
// TODO: Replace every value marked "PLACEHOLDER" with your real information.

// Falls back when the variable is unset *or empty* (an empty value in the
// hosting dashboard crashes `new URL()`), and accepts a bare domain.
function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

export const siteConfig = {
  // Set NEXT_PUBLIC_SITE_URL in .env.local (dev) and in your hosting provider (prod).
  url: siteUrl(),

  name: "Nitin Singh", // PLACEHOLDER: your full name
  title: "Nitin Singh | Portfolio", // PLACEHOLDER: default page title
  description: "Your portfolio description", // PLACEHOLDER
  jobTitle: "Software Developer", // PLACEHOLDER: your job title
  keywords: ["portfolio", "developer"], // PLACEHOLDER: add relevant keywords
  locale: "en_US",

  twitterHandle: "@your-handle", // PLACEHOLDER: your X/Twitter handle (or remove)

  email: "hello@example.com", // PLACEHOLDER: your contact email (footer CTA)

  // PLACEHOLDER: your public profile URLs (used in JSON-LD "sameAs")
  socials: [
    "https://github.com/your-username",
    "https://www.linkedin.com/in/your-username",
  ],
};

// Central SEO / site configuration.
// TODO: Replace every value marked "PLACEHOLDER" with your real information.

export const siteConfig = {
  // Set NEXT_PUBLIC_SITE_URL in .env.local (dev) and in your hosting provider (prod).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

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

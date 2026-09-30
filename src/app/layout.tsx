import type { Metadata } from "next";
import { Geist_Mono, Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import SmoothScroll from "@/components/smooth-scroll/SmoothScroll";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { education } from "@/content/portfolio";
import { publicProfiles, siteConfig } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// The site's one type system (tokens in globals.css): Host Grotesk for display
// and body (variable, so in-between weights like 550 work), Plex Mono for labels.
const grotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

// Only the footer's small mono caption uses this (Tailwind's font-mono).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  // The share image is src/app/opengraph-image.tsx (file-based metadata wins
  // over an `images` field here). To use a designed PNG instead, delete that
  // file and add src/app/opengraph-image.png at 1200×630.
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.shareDescription,
  },
  // No X handle is set on purpose — add `creator: "@handle"` only if one exists.
  // twitter:image comes from src/app/twitter-image.tsx.
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.jobTitle}`,
    description: siteConfig.shareDescription,
  },
  // Favicon: src/app/favicon.ico is picked up by the file convention.
  // Google Search Console: if you verify with the HTML-tag method, add
  //   verification: { google: "<token from Search Console>" },
  // (not needed when verifying with the DNS record for nitinverse.me).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// One graph so the nodes can reference each other by @id. Only facts that are
// on the page itself belong here.
const homeUrl = `${siteConfig.url}/`;
const personId = `${siteConfig.url}/#person`;
const websiteId = `${siteConfig.url}/#website`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.name,
      url: homeUrl,
      jobTitle: siteConfig.jobTitle,
      description: siteConfig.description,
      knowsAbout: siteConfig.knowsAbout,
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: education.institution,
        address: { "@type": "PostalAddress", addressLocality: education.city },
      },
      ...(publicProfiles.length > 0 && { sameAs: publicProfiles }),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: homeUrl,
      inLanguage: "en-IN",
      author: { "@id": personId },
    },
    {
      "@type": "ProfilePage",
      "@id": `${homeUrl}#profile`,
      url: homeUrl,
      name: siteConfig.title,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": personId },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${plexMono.variable} ${geistMono.variable} h-full antialiased`}
      // data-theme is set by the inline script below before hydration
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* before anything paints: the saved theme, or the system's */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={structuredData} />
        <SmoothScroll />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}

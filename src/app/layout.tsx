import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import SmoothScroll from "@/components/smooth-scroll/SmoothScroll";
import { publicProfiles, siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
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

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteConfig.url}/#person`,
  name: siteConfig.name,
  url: siteConfig.url,
  jobTitle: siteConfig.jobTitle,
  ...(publicProfiles.length > 0 && { sameAs: publicProfiles }),
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "en",
  author: { "@id": person["@id"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={person} />
        <JsonLd data={website} />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}

import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import { BUSINESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const TITLE = `${SITE_NAME} — Matériel agricole et de chantier`;
const OG_IMAGE = "/brands/massey-ferguson-poster.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Agrisem",
    "matériel agricole Belgique",
    "Massey Ferguson Belgique",
    "Merlo chargeur télescopique",
    "Kuhn matériel agricole",
    "Takeuchi mini-pelle",
    "Giant chargeur compact",
    "concessionnaire agricole Daussois",
    "matériel de chantier Belgique",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1080,
        alt: `${SITE_NAME} — matériel agricole et de chantier`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#122a4d",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": SITE_URL,
  name: BUSINESS.name,
  url: SITE_URL,
  image: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  telephone: BUSINESS.telephone,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.streetAddress,
    postalCode: BUSINESS.postalCode,
    addressLocality: BUSINESS.addressLocality,
    addressCountry: BUSINESS.addressCountry,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
          />
          <Script id="reveal-fallback" strategy="beforeInteractive">
          {`
          (function () {
          function reveal() {
          if (!("IntersectionObserver" in window)) {
          document.querySelectorAll(".reveal").forEach(function (el) {
          el.classList.add("is-visible");
          });
          return;
          }
          var observer = new IntersectionObserver(
          function (entries) {
          entries.forEach(function (entry) {
          if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
          }
          });
          },
          { threshold: 0.15 }
          );
          document.querySelectorAll(".reveal").forEach(function (el) {
          observer.observe(el);
          });
          }
          if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", reveal);
          } else {
          reveal();
          }
          })();
          `}
          </Script>
          <SiteHeader />
          {children}
          <SiteFooter />
          <CookieConsent />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
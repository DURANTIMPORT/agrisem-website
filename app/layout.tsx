import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agrisem S.A. — Matériel agricole et de chantier",
  description:
    "Agrisem S.A., concessionnaire à Daussois pour Massey Ferguson, Merlo, Takeuchi et Giant.",
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
        <Header />
        {children}
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}

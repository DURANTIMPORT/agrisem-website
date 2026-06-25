import type { NextConfig } from "next";

const securityHeaders = [
  // Empêche l'intégration du site dans un iframe
  { key: "X-Frame-Options", value: "DENY" },

  // Empêche le sniffing de type MIME
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Envoie l'origine uniquement sur les requêtes cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Désactive les capteurs sensibles
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },

  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'none'",
      // Chunks Next.js + scripts inline (reveal-fallback, hydratation) + GA4
      // + Clerk JS (espace /pro, chargé depuis le frontend API *.clerk.accounts.dev)
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      // Tailwind + attributs style inline (couleurs d'accent par marque)
      "style-src 'self' 'unsafe-inline'",
      // Images optimisées via /_next/image + pixel GA4 + avatars Clerk
      "img-src 'self' data: https://www.google-analytics.com https://img.clerk.com",
      // next/font/google auto-héberge au build → même origine uniquement
      "font-src 'self'",
      // fetch('/api/contact') same-origin ; balises GA4 ; API Clerk + télémétrie
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.clerk.accounts.dev https://clerk-telemetry.com https://challenges.cloudflare.com",
      // Clerk utilise des web workers (blob:)
      "worker-src 'self' blob:",
      // Vidéos hero servies depuis /brands/*.mp4 et .webm
      "media-src 'self'",
      // Clerk : composants embarqués + protection anti-bot Cloudflare Turnstile
      "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      // Pas de plugins (<object>, <embed>)
      "object-src 'none'",
      // Protège contre l'injection de balise <base>
      "base-uri 'self'",
      // Soumission de formulaire uniquement vers /api/contact (même origine)
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Les PDF MF (jusqu'à ~1,5 Mo) sont envoyés à une server action pour l'import.
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

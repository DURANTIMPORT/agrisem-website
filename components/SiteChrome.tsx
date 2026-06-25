"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

// La vitrine publique (Header/Footer marketing) ne s'affiche PAS dans l'espace
// privé /pro ni sur les pages d'authentification, qui ont leur propre habillage.
function estPrive(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/pro") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  );
}

export function SiteHeader() {
  return estPrive(usePathname()) ? null : <Header />;
}

export function SiteFooter() {
  return estPrive(usePathname()) ? null : <Footer />;
}

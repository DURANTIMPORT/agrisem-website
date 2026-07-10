import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Seul l'espace privé /pro (et son API) est protégé. Toute la vitrine
// publique (/, /contact, /a-propos, /evenements, /api/contact, sign-in/up…)
// reste accessible sans authentification. Règle d'or : ne rien casser du public.
const isProtectedPage = createRouteMatcher(["/pro(.*)"]);
const isProtectedApi = createRouteMatcher(["/api/pro(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Pages privées : un visiteur non connecté est redirigé vers notre page de
  // connexion /sign-in (redirection explicite, car le redirectToSignIn() de
  // Clerk pointait vers une URL invalide en prod → 404).
  if (isProtectedPage(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // API privée : on garde une protection stricte (pas de redirection HTML).
  if (isProtectedApi(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

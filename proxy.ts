import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Seul l'espace privé /pro (et son API) est protégé. Toute la vitrine
// publique (/, /contact, /a-propos, /evenements, /api/contact, sign-in/up…)
// reste accessible sans authentification. Règle d'or : ne rien casser du public.
const isProtectedPage = createRouteMatcher(["/pro(.*)"]);
const isProtectedApi = createRouteMatcher(["/api/pro(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Pages privées : un visiteur non connecté est redirigé vers la page de
  // connexion (et non vers un 404, comportement par défaut de auth.protect()).
  if (isProtectedPage(request)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();
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

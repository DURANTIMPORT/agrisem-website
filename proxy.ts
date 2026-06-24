import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Seul l'espace privé /pro (et son API) est protégé. Toute la vitrine
// publique (/, /contact, /a-propos, /evenements, /api/contact, sign-in/up…)
// reste accessible sans authentification. Règle d'or : ne rien casser du public.
const isProtectedRoute = createRouteMatcher(["/pro(.*)", "/api/pro(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

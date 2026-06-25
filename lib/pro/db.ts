import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Connexion Neon (HTTP, adaptée au serverless Vercel). Renvoie null si la
// variable DATABASE_URL n'est pas configurée — le catalogue retombe alors
// sur les données d'exemple (seed), sans planter.
let cached: NeonQueryFunction<false, false> | null = null;

export function db(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) cached = neon(url);
  return cached;
}

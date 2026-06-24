import { GAMMES } from "./seed";
import type { Gamme, SousNiveau, Modele } from "./types";

export type { Gamme, SousNiveau, Modele } from "./types";
export type {
  GrilleRemise,
  EtapeRemise,
  MachineStock,
  RegimeRemise,
} from "./types";

// Interface d'accès au catalogue. Aujourd'hui synchrone (seed en mémoire) ;
// pourra devenir asynchrone (Neon) sans changer la forme des données.

export function getGammes(): Gamme[] {
  return [...GAMMES].sort((a, b) => a.ordre - b.ordre);
}

export function getGamme(slug: string): Gamme | null {
  return GAMMES.find((g) => g.slug === slug) ?? null;
}

export function getSousNiveau(
  gamme: Gamme,
  slug: string
): SousNiveau | null {
  return gamme.sousNiveaux.find((sn) => sn.slug === slug) ?? null;
}

export function getModele(
  sousNiveau: SousNiveau,
  slug: string
): Modele | null {
  return sousNiveau.modeles.find((m) => m.slug === slug) ?? null;
}

/**
 * Un seul sous-niveau (ou aucun) → on saute cet écran et on affiche
 * directement les modèles (cf. brief §3).
 */
export function sauterSousNiveau(gamme: Gamme): boolean {
  return gamme.sousNiveaux.length <= 1;
}

/** Le sous-niveau unique d'une gamme (quand on saute l'écran intermédiaire). */
export function sousNiveauUnique(gamme: Gamme): SousNiveau | null {
  return gamme.sousNiveaux[0] ?? null;
}

// Disponibilité = nombre de machines en stock, agrégée vers le haut.

export function stockModele(modele: Modele): number {
  return modele.stock.length;
}

export function stockSousNiveau(sousNiveau: SousNiveau): number {
  return sousNiveau.modeles.reduce((n, m) => n + m.stock.length, 0);
}

export function stockGamme(gamme: Gamme): number {
  return gamme.sousNiveaux.reduce((n, sn) => n + stockSousNiveau(sn), 0);
}

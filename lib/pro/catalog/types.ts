// Modèle de données du catalogue Massey Ferguson (espace /pro).
// Cf. docs/pro-architecture.md §3. Pour l'instant alimenté par un jeu de
// données d'exemple (seed.ts) ; sera remplacé par Neon Postgres derrière la
// même interface (lib/pro/catalog/index.ts) en restant compatible.

export type RegimeRemise = "stock" | "commande";
export type TypeEtape = "pct" | "eur";
export type ConditionEtape = "mfguide" | "chargeur";

/** Une étape de remise = une colonne du PDF, appliquée dans l'ordre. */
export interface EtapeRemise {
  type: TypeEtape; // pct = pourcentage, eur = montant fixe
  valeur: number;
  label: string;
  conditionnel?: ConditionEtape; // appliquée seulement si cochée
}

/** Grille de remises pour un régime donné (stock ≠ nouvelle commande). */
export interface GrilleRemise {
  regime: RegimeRemise;
  etapes: EtapeRemise[];
}

/** Machine physique réellement en stock, rattachée à un modèle. */
export interface MachineStock {
  po: string; // numéro de PO
  prixBrut: number;
  config: string; // pneus, options, guidage…
}

export interface Modele {
  nom: string; // ex. "7S.165"
  slug: string; // ex. "7s-165"
  prixRetailMf?: number; // prix retail fourni par MF (badge "PRIX MF")
  grilles: GrilleRemise[];
  stock: MachineStock[];
}

export type TypeSousNiveau = "transmission" | "sous_serie" | "aucun";

export interface SousNiveau {
  nom: string; // ex. "Dyna-VT", "1M", ou "Standard"
  slug: string; // ex. "dyna-vt", "1m", "tous"
  type: TypeSousNiveau;
  modeles: Modele[];
}

export interface Gamme {
  nom: string; // ex. "7S"
  slug: string; // ex. "7s"
  ordre: number; // ordre imposé (fréquence de vente, pas alphabétique)
  sousNiveaux: SousNiveau[];
}

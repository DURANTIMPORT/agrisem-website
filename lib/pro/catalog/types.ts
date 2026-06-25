// Modèle de données du catalogue Massey Ferguson (espace /pro).
// Aligné sur le prototype validé (simulateur_remises_mf). Cf. docs/pro-architecture.md.
// Alimenté pour l'instant par seed.ts ; remplaçable par Neon derrière la même forme.

export type TypeEtape = "pct" | "eur";
export type ConditionEtape = "mfguide" | "chargeur";

/** Une étape de remise, appliquée dans l'ordre sur le prix brut. */
export interface EtapeRemise {
  type: TypeEtape; // pct = pourcentage, eur = montant fixe
  valeur: number;
  label: string;
  conditionnel?: ConditionEtape; // appliquée seulement si l'équipement est coché
}

/** Machine physique réellement en stock, rattachée à un modèle. */
export interface MachineStock {
  po: string | null; // numéro de PO (parfois absent)
  prixBrut: number | null; // null = « sur demande » (machines de démo)
  config: string; // pneus, options, guidage…
}

export interface Modele {
  nom: string; // ex. "7S.165 EXC"
  etapes: EtapeRemise[]; // grille « nouvelles commandes » (régime par défaut)
  etapesStock?: EtapeRemise[]; // grille « liste de stock » (si différente)
  brutIndicatif?: number; // prix brut indicatif (mode « configurer en neuf »)
  prixRetailMf?: number; // prix retail fourni par MF (badge « PRIX MF »)
  stock: MachineStock[];
}

export type TypeSousNiveau = "transmission" | "sous_serie" | "aucun";

export interface SousNiveau {
  key: string; // identifiant court (d4, vt, 1, vi, _…)
  label: string; // ex. "Dyna-VT", "Série 1 · 1M / 1E", "" si aucun
  type: TypeSousNiveau;
  modeles: Modele[];
}

export interface Gamme {
  key: string; // ex. "7S"
  label: string; // ex. "7S"
  desc: string; // ex. "Forte puissance"
  ordre: number; // ordre imposé (fréquence de vente)
  labelSousNiveau: string | null; // "Transmission" | "Sous-série" | null
  sousNiveaux: SousNiveau[];
}

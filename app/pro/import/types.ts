export type MachineExtraite = {
  modele: string | null;
  po: string | null;
  prixBrut: number | null;
  config: string | null;
  // Correspondance avec le catalogue (proposée par l'IA, résolue côté serveur)
  gammeKey?: string | null;
  sousKey?: string | null;
  modeleCatalogue?: string | null; // nom exact du modèle catalogue
  matchLabel?: string | null; // ex. "5S · Dyna-6 · 5S.145"
  reconnu?: boolean;
};

export type EtapeExtraite = {
  type: "pct" | "eur";
  valeur: number;
  label: string;
  conditionnel?: "mfguide" | "chargeur";
};

export type ModeleGrille = {
  modele: string | null; // nom tel que lu dans le PDF
  gammeKey?: string | null;
  sousKey?: string | null;
  modeleCatalogue?: string | null;
  matchLabel?: string | null;
  reconnu?: boolean;
  etapes: EtapeExtraite[];
};

export type ImportState = {
  error?: string;
  source?: string;
  machines?: MachineExtraite[]; // sources stock
  modeles?: ModeleGrille[]; // sources grilles de remises
};

export type PublishState = {
  error?: string;
  success?: string;
};

export const SOURCES: { value: string; label: string; supporte: boolean }[] = [
  { value: "stock_tracteurs", label: "Liste stock — tracteurs", supporte: true },
  { value: "stock_fenaison", label: "Liste stock — fenaison", supporte: true },
  { value: "remises_commande", label: "Grille remises — nouvelles commandes", supporte: true },
  { value: "remises_stock", label: "Grille remises — liste de stock", supporte: true },
  { value: "actions", label: "Actions commerciales", supporte: false },
];

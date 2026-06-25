export type MachineExtraite = {
  modele: string | null;
  po: string | null;
  prixBrut: number | null;
  config: string | null;
};

export type ImportState = {
  error?: string;
  source?: string;
  machines?: MachineExtraite[];
};

export const SOURCES: { value: string; label: string; supporte: boolean }[] = [
  { value: "stock_tracteurs", label: "Liste stock — tracteurs", supporte: true },
  { value: "stock_fenaison", label: "Liste stock — fenaison", supporte: true },
  { value: "remises_commande", label: "Grille remises — nouvelles commandes", supporte: false },
  { value: "remises_stock", label: "Grille remises — liste de stock", supporte: false },
  { value: "actions", label: "Actions commerciales", supporte: false },
];

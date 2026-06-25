import type { EtapeRemise } from "@/lib/pro/catalog";

// Moteur de calcul déterministe (cf. docs/pro-architecture.md §4).
// Applique les étapes DANS L'ORDRE sur le prix brut :
//   - pct → courant = courant × (1 − valeur/100)
//   - eur → courant = courant − valeur
//   - étape conditionnelle non cochée → ignorée
// Résultat = prix net concessionnaire, arrondi à l'entier (tolérance ±1 €).

export interface OptionsCalcul {
  mfguide?: boolean;
  chargeur?: boolean;
}

export interface LigneTicket {
  label: string;
  type: "pct" | "eur";
  valeur: number;
  montantRemise: number; // montant retiré à cette étape
  sousTotal: number; // prix courant après cette étape
  ignoree?: boolean; // conditionnelle non cochée
}

export interface ResultatCalcul {
  brut: number;
  net: number;
  lignes: LigneTicket[];
}

export function calculerNet(
  brut: number,
  etapes: EtapeRemise[],
  options: OptionsCalcul = {}
): ResultatCalcul {
  let courant = brut;
  const lignes: LigneTicket[] = [];

  for (const e of etapes) {
    // Étape conditionnelle (MF Guide, chargeur) : appliquée seulement si cochée
    if (e.conditionnel && !options[e.conditionnel]) {
      lignes.push({
        label: e.label,
        type: e.type,
        valeur: e.valeur,
        montantRemise: 0,
        sousTotal: courant,
        ignoree: true,
      });
      continue;
    }

    const avant = courant;
    if (e.type === "pct") {
      courant = courant * (1 - e.valeur / 100);
    } else {
      courant = courant - e.valeur;
    }

    lignes.push({
      label: e.label,
      type: e.type,
      valeur: e.valeur,
      montantRemise: avant - courant,
      sousTotal: courant,
    });
  }

  return { brut, net: Math.round(courant), lignes };
}

/** Marge = prix retail − prix net concessionnaire (null si retail inconnu). */
export function calculerMarge(net: number, retail: number | null): number | null {
  if (retail == null) return null;
  return retail - net;
}

import { GAMMES } from "./seed";
import type { Gamme } from "./types";

export type {
  Gamme,
  SousNiveau,
  Modele,
  EtapeRemise,
  MachineStock,
  TypeEtape,
  ConditionEtape,
} from "./types";

// Interface d'accès au catalogue. Aujourd'hui synchrone (seed en mémoire) ;
// pourra devenir asynchrone (Neon) sans changer la forme des données.
export function getGammes(): Gamme[] {
  return [...GAMMES].sort((a, b) => a.ordre - b.ordre);
}

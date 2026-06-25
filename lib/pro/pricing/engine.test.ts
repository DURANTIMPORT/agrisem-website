import { calculerNet } from "./engine";
import type { EtapeRemise } from "@/lib/pro/catalog";

// Cas de non-régression du cahier des charges (docs/pro-architecture.md §4).
// Exécuter : npx tsx lib/pro/pricing/engine.test.ts  (tolérance ±1 €)

const pct = (valeur: number, label = ""): EtapeRemise => ({ type: "pct", valeur, label });
const eur = (valeur: number, label = ""): EtapeRemise => ({ type: "eur", valeur, label });

const cas = [
  { nom: "1M.25 HP", brut: 25890, etapes: [pct(15), eur(5000), eur(1600)], attendu: 15406 },
  {
    nom: "6S.155 D6 (Black Ed.)",
    brut: 168825,
    etapes: [eur(11000), pct(15), eur(15000), eur(10000)],
    attendu: 109152,
  },
  {
    nom: "7S.165 VT (Black Ed.)",
    brut: 215690,
    etapes: [eur(2000), pct(20), eur(15000), eur(14500)],
    attendu: 141452,
  },
];

let ok = true;
for (const c of cas) {
  const { net } = calculerNet(c.brut, c.etapes);
  const ecart = Math.abs(net - c.attendu);
  const pass = ecart <= 1;
  if (!pass) ok = false;
  console.log(`${pass ? "✓" : "✗"} ${c.nom} : ${net} € (attendu ${c.attendu} €, écart ${ecart} €)`);
}

if (!ok) {
  console.error("\nÉCHEC : au moins un cas hors tolérance.");
  process.exit(1);
}
console.log("\nTous les cas de non-régression passent (±1 €).");

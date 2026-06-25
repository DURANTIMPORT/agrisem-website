import type { Gamme, EtapeRemise, Modele } from "./types";

// Données issues du prototype validé (grilles + liste stock Matermaco, échantillon).
// Seront remplacées par les vraies données via Neon + l'import PDF (Phase 3).
// Ordre des gammes = fréquence de vente (imposé).

const pct = (valeur: number): EtapeRemise => ({ type: "pct", valeur, label: "Remise commerciale" });
const eur = (valeur: number, label: string): EtapeRemise => ({ type: "eur", valeur, label });
const mfguide = (): EtapeRemise => ({ type: "eur", valeur: 5000, label: "MF Guide Trimble", conditionnel: "mfguide" });
const chargeur = (valeur = 2000): EtapeRemise => ({ type: "eur", valeur, label: "Chargeur usine", conditionnel: "chargeur" });

// Gabarits de grilles par série / transmission
const T = {
  s5_4: (n: number) => [eur(n, "Remise modèle"), mfguide(), pct(15), eur(10000, "Remise campagne"), eur(7500, "Action Dyna (net)"), chargeur()],
  s5_6: (n: number) => [eur(n, "Remise modèle"), mfguide(), pct(15), eur(10000, "Remise campagne"), chargeur()],
  s6: (n: number) => [eur(n, "Remise modèle"), pct(15), eur(15000, "Remise campagne"), chargeur()],
  s7_6: (n: number) => [eur(n, "Remise modèle"), pct(15), eur(15000, "Remise campagne"), chargeur()],
  s7_vt: (n: number) => [eur(n, "Remise modèle"), pct(20), eur(15000, "Remise campagne"), chargeur()],
  s5m: (n: number) => [eur(n, "Remise modèle"), mfguide(), pct(15), eur(8000, "Remise campagne"), eur(2000, "Remise gamme"), chargeur()],
  s8_ep: (n: number) => [eur(n, "Remise modèle"), pct(15), eur(15000, "Remise campagne")],
  s8_vt: (n: number) => [eur(n, "Remise modèle"), pct(20), eur(15000, "Remise campagne")],
  s9: (n: number) => [eur(n, "Remise modèle"), pct(15), eur(7000, "Remise campagne")],
  spec: (n: number) => [pct(15), eur(6500, "Remise gamme"), eur(n, "Remise modèle")],
  comp: (g: number, mo: number) => [pct(15), eur(g, "Remise gamme"), eur(mo, "Remise modèle")],
  th: (n: number) => [eur(n, "Remise modèle"), pct(15), eur(10000, "Remise campagne"), eur(5000, "Remise stock")],
  m4700: (mo: number) => [pct(15), eur(8000, "Remise campagne"), eur(mo, "Remise cabine"), chargeur(1500)],
};

type StockBrut = { po: string; brut: number; cfg: string };
const m = (
  nom: string,
  etapes: EtapeRemise[],
  x: { brut?: number; retail?: number; stock?: StockBrut[] } = {}
): Modele => ({
  nom,
  etapes,
  brutIndicatif: x.brut,
  prixRetailMf: x.retail,
  stock: (x.stock ?? []).map((s) => ({ po: s.po, prixBrut: s.brut, config: s.cfg })),
});

export const GAMMES: Gamme[] = [
  {
    key: "5S", label: "5S", desc: "Polyvalent · le plus vendu", ordre: 1, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "d4", label: "Dyna-4", type: "transmission", modeles: [
        m("5S.105", T.s5_4(3000)), m("5S.115", T.s5_4(4000)),
        m("5S.125", T.s5_4(5000), { stock: [
          { po: "9205", brut: 132650, cfg: "D4 ESS · 600/65 R38 Mitas" },
          { po: "9380", brut: 131810, cfg: "D4 EFF · 600/65 R38" }] }),
        m("5S.135", T.s5_4(5000)), m("5S.145", T.s5_4(6000)),
      ]},
      { key: "d6", label: "Dyna-6", type: "transmission", modeles: [
        m("5S.105", T.s5_6(3000)), m("5S.115", T.s5_6(4000)),
        m("5S.125 EXC", T.s5_6(5000), { stock: [{ po: "8982", brut: 155280, cfg: "520/70 R38 Trelleborg · RTK" }] }),
        m("5S.135", T.s5_6(5000)), m("5S.145", T.s5_6(6000)),
      ]},
      { key: "vt", label: "Dyna-VT", type: "transmission", modeles: [
        m("5S.105", T.s5_4(3000)), m("5S.115", T.s5_4(4000)), m("5S.125", T.s5_4(5000)),
        m("5S.135 EXC", T.s5_4(5000), { stock: [
          { po: "9479", brut: 161660, cfg: "520/70 R38" },
          { po: "9480", brut: 188270, cfg: "LL004 + FL4124 · RTK" }] }),
        m("5S.145", T.s5_4(6000)),
      ]},
    ],
  },
  {
    key: "6S", label: "6S", desc: "Grandes cultures", ordre: 2, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "d6", label: "Dyna-6", type: "transmission", modeles: [
        m("6S.135", T.s6(11000)),
        m("6S.145 EFF", T.s6(11000), { stock: [{ po: "9110", brut: 159680, cfg: "520/85 R38 Mitas" }] }),
        m("6S.155", T.s6(11000)),
        m("6S.165 EXC", T.s6(11000), { stock: [{ po: "9505", brut: 191150, cfg: "650/65 R38 Vredestein · RTK+96" }] }),
        m("6S.180", T.s6(12500)),
      ]},
      { key: "vt", label: "Dyna-VT", type: "transmission", modeles: [
        m("6S.135", T.s6(11000)), m("6S.145", T.s6(11000)),
        m("6S.155 EXC", T.s6(11000), { stock: [{ po: "8979", brut: 206430, cfg: "650/60 R42 Michelin · RTK+24+VRC2" }] }),
        m("6S.165", T.s6(11000)), m("6S.180", T.s6(12500)),
      ]},
    ],
  },
  {
    key: "7S", label: "7S", desc: "Forte puissance", ordre: 3, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "d6", label: "Dyna-6", type: "transmission", modeles: [
        m("7S.155 EFF", T.s7_6(7000), { stock: [{ po: "9219", brut: 175100, cfg: "650/65 R38 WF Mitas" }] }),
        m("7S.165 EXC", T.s7_6(8000), { stock: [{ po: "8508", brut: 199675, cfg: "650/75 R38 SFT · RTK+24+VRC2" }] }),
        m("7S.180 EXC", T.s7_6(11000), { stock: [{ po: "9107", brut: 210370, cfg: "650/75 R38 WS SFT · RTK+24+VRC2" }] }),
      ]},
      { key: "vt", label: "Dyna-VT", type: "transmission", modeles: [
        m("7S.155", T.s7_vt(0)),
        m("7S.165 EXC", T.s7_vt(2000), { stock: [{ po: "9388", brut: 215380, cfg: "650/65 R42 WF · RTK+96" }] }),
        m("7S.180 EXC", T.s7_vt(7000), { stock: [{ po: "9508", brut: 231915, cfg: "VF 710/60 R42 WS · RTK+96" }] }),
        m("7S.190 EXC", T.s7_vt(7000), { stock: [{ po: "9415", brut: 219660, cfg: "650/65 R42 WS · MF Guide Ready" }] }),
        m("7S.210 EXC", T.s7_vt(7000), { stock: [
          { po: "9509", brut: 235680, cfg: "VF 710/60 R42 WS · RTK+96" },
          { po: "9510", brut: 237505, cfg: "VF 710/60 R42 WS · RTK+96" }] }),
      ]},
    ],
  },
  {
    key: "5M", label: "5M", desc: "Mixte / élevage", ordre: 4, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "d4", label: "Dyna-4", type: "transmission", modeles: [
        m("5M.95", T.s5m(3500)),
        m("5M.105", T.s5m(4000), { stock: [
          { po: "8973", brut: 95940, cfg: "540/65 R38 Mitas" },
          { po: "9228", brut: 123280, cfg: "LL004 + FL4018 · MF Guide Egnos" }] }),
        m("5M.115", T.s5m(4500), { stock: [{ po: "8971", brut: 112380, cfg: "540/65 R38 · MF Guide Egnos" }] }),
        m("5M.125", T.s5m(5500)), m("5M.135", T.s5m(6000)),
        m("5M.145", T.s5m(7000), { stock: [{ po: "9379", brut: 111210, cfg: "540/65 R38" }] }),
      ]},
    ],
  },
  {
    key: "8S", label: "8S", desc: "Très forte puissance", ordre: 5, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "ep", label: "Xtra E-Power", type: "transmission", modeles: [
        m("8S.205 Xtra", T.s8_ep(7000)), m("8S.225 Xtra", T.s8_ep(7000)),
        m("8S.245 Xtra", T.s8_ep(9000)), m("8S.265 Xtra", T.s8_ep(9500)),
      ]},
      { key: "vt", label: "Xtra Dyna-VT", type: "transmission", modeles: [
        m("8S.205 Xtra", T.s8_vt(5000)), m("8S.225 Xtra", T.s8_vt(5000)), m("8S.245 Xtra", T.s8_vt(5000)),
        m("8S.265 Xtra", T.s8_vt(5000), { stock: [{ po: "9408", brut: 296160, cfg: "VF 710/70 R42 Axiobib 2 · RTK+96" }] }),
        m("8S.285 Xtra", T.s8_vt(5000)),
        m("8S.305 Xtra", T.s8_vt(5000), { stock: [
          { po: "9463", brut: 299830, cfg: "VF 710/70 R42 Axiobib 2 · RTK+96" },
          { po: "9511", brut: 292858, cfg: "710/70 R42 Vredestein · RTK+96" }] }),
      ]},
    ],
  },
  {
    key: "9S", label: "9S", desc: "Sommet de gamme", ordre: 6, labelSousNiveau: "Transmission",
    sousNiveaux: [
      { key: "vt", label: "Dyna-VT", type: "transmission", modeles: [
        m("9S.285", T.s9(6000)), m("9S.310", T.s9(6000)),
        m("9S.340 EXC", T.s9(12000), { stock: [{ po: "8513", brut: 334125, cfg: "VF 710/75 R42 Bridgestone · RTK+24+VRC2" }] }),
        m("9S.370", T.s9(12000)), m("9S.400", T.s9(12000)), m("9S.425", T.s9(12000)),
      ]},
    ],
  },
  {
    key: "3SPE", label: "3 Speciality", desc: "Vignes · vergers", ordre: 7, labelSousNiveau: "Sous-série",
    sousNiveaux: [
      { key: "vi", label: "3VI · Vignes", type: "sous_serie", modeles: [
        m("3VI.75 ESS", T.spec(1000)), m("3VI.85 ESS", T.spec(2000)), m("3VI.95 ESS", T.spec(3500)),
        m("3VI.105 ESS", T.spec(5500)), m("3VI.115 ESS", T.spec(5500)),
      ]},
      { key: "sp", label: "3SP · Spéciale", type: "sous_serie", modeles: [
        m("3SP.75 ESS", T.spec(3500)), m("3SP.85 ESS", T.spec(4500)), m("3SP.95 ESS", T.spec(7000)),
        m("3SP.105 ESS", T.spec(8500)), m("3SP.115 ESS", T.spec(8500)),
      ]},
    ],
  },
  {
    key: "COMP", label: "Compact (1 · 2)", desc: "Séries 1M · 1E · 2M · 2E", ordre: 8, labelSousNiveau: "Sous-série",
    sousNiveaux: [
      { key: "1", label: "Série 1 · 1M / 1E", type: "sous_serie", modeles: [
        m("1M.20 MP", T.comp(3500, 0)),
        m("1M.25 HP", T.comp(5000, 1600), { retail: 17900, stock: [{ po: "9634", brut: 33338, cfg: "300/70 R20 Garden Pro · + FL" }] }),
        m("1M.40 HP", T.comp(6000, 3000), { brut: 43130, retail: 31000 }),
        m("1M.40 HC", T.comp(6000, 5000), { brut: 53690, retail: 38000 }),
        m("1E.40 MP", T.comp(6000, 0)),
      ]},
      { key: "2", label: "Série 2 · 2M / 2E", type: "sous_serie", modeles: [
        m("2E.55 MP", T.comp(6000, 2500), { brut: 39620, retail: 28500 }),
        m("2M.50 HC", T.comp(6000, 6500), { brut: 59910, retail: 42000 }),
        m("2M.65 HC", T.comp(6000, 6000)),
      ]},
    ],
  },
  {
    key: "TH", label: "TH télescopiques", desc: "Moins demandé", ordre: 9, labelSousNiveau: null,
    sousNiveaux: [
      { key: "_", label: "", type: "aucun", modeles: [
        m("TH.7035", T.th(2000)), m("TH.6534", T.th(2000)),
        m("TH.7038 EFF", T.th(12500), { stock: [
          { po: "8862", brut: 138240, cfg: "460/70 R24 Alliance · Manitou méca" },
          { po: "8778", brut: 142220, cfg: "460/70 R24 Alliance · Merlo hydraulique" }] }),
        m("TH.8043", T.th(11000)),
      ]},
    ],
  },
  {
    key: "4700", label: "4700 M", desc: "Moins demandé", ordre: 10, labelSousNiveau: null,
    sousNiveaux: [
      { key: "_", label: "", type: "aucun", modeles: [
        m("4708 M Cab", T.m4700(4500)), m("4709 M Cab", T.m4700(4500)), m("4710 M Cab", T.m4700(4500)),
      ]},
    ],
  },
];

import type { Gamme } from "./types";

// ⚠️ DONNÉES D'EXEMPLE — échantillon représentatif pour développer la
// navigation de la Phase 1. Les gammes, transmissions et les 3 modèles
// vérifiés (1M.25, 6S.155 D6, 7S.165 VT) sont réels ; le reste est un
// échantillon plausible. Sera remplacé par les vraies données via Neon +
// l'import PDF (Phase 3). Ordre des gammes = fréquence de vente (imposé).

export const GAMMES: Gamme[] = [
  {
    nom: "5S",
    slug: "5s",
    ordre: 1,
    sousNiveaux: [
      {
        nom: "Dyna-4",
        slug: "dyna-4",
        type: "transmission",
        modeles: [
          { nom: "5S.105", slug: "5s-105", grilles: [], stock: [] },
          { nom: "5S.115", slug: "5s-115", grilles: [], stock: [] },
        ],
      },
      {
        nom: "Dyna-6",
        slug: "dyna-6",
        type: "transmission",
        modeles: [
          {
            nom: "5S.125",
            slug: "5s-125",
            grilles: [],
            stock: [
              { po: "MF-5S-2241", prixBrut: 98500, config: "Relevage avant, pneus 540/65R38" },
            ],
          },
          { nom: "5S.135", slug: "5s-135", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "6S",
    slug: "6s",
    ordre: 2,
    sousNiveaux: [
      {
        nom: "Dyna-6",
        slug: "dyna-6",
        type: "transmission",
        modeles: [
          { nom: "6S.135", slug: "6s-135", grilles: [], stock: [] },
          { nom: "6S.145", slug: "6s-145", grilles: [], stock: [] },
          {
            nom: "6S.155",
            slug: "6s-155",
            prixRetailMf: 117500,
            grilles: [
              {
                regime: "stock",
                etapes: [
                  { type: "eur", valeur: 11000, label: "Remise Black Edition" },
                  { type: "pct", valeur: 15, label: "Remise concessionnaire" },
                  { type: "eur", valeur: 15000, label: "Action stock" },
                  { type: "eur", valeur: 10000, label: "Bonus reprise" },
                  { type: "eur", valeur: 4000, label: "Chargeur frontal FL", conditionnel: "chargeur" },
                ],
              },
            ],
            stock: [
              { po: "MF-6S-1187", prixBrut: 168825, config: "Black Edition, Dyna-6, chargeur FL.4327" },
            ],
          },
        ],
      },
      {
        nom: "Dyna-VT",
        slug: "dyna-vt",
        type: "transmission",
        modeles: [
          { nom: "6S.165", slug: "6s-165", grilles: [], stock: [] },
          { nom: "6S.180", slug: "6s-180", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "7S",
    slug: "7s",
    ordre: 3,
    sousNiveaux: [
      {
        nom: "Dyna-6",
        slug: "dyna-6",
        type: "transmission",
        modeles: [
          { nom: "7S.155", slug: "7s-155", grilles: [], stock: [] },
          { nom: "7S.165", slug: "7s-165-d6", grilles: [], stock: [] },
        ],
      },
      {
        nom: "Dyna-VT",
        slug: "dyna-vt",
        type: "transmission",
        modeles: [
          {
            nom: "7S.165",
            slug: "7s-165",
            prixRetailMf: 149900,
            grilles: [
              {
                regime: "stock",
                etapes: [
                  { type: "eur", valeur: 2000, label: "Remise Black Edition" },
                  { type: "pct", valeur: 20, label: "Remise concessionnaire" },
                  { type: "eur", valeur: 15000, label: "Action stock" },
                  { type: "eur", valeur: 14500, label: "Bonus reprise" },
                  { type: "eur", valeur: 3500, label: "MF Guide RTK", conditionnel: "mfguide" },
                ],
              },
            ],
            stock: [
              { po: "MF-7S-3402", prixBrut: 215690, config: "Black Edition, Dyna-VT, guidage RTK" },
              { po: "MF-7S-3418", prixBrut: 212400, config: "Dyna-VT, chargeur FL.4327, pneus VF" },
            ],
          },
          { nom: "7S.190", slug: "7s-190", grilles: [], stock: [] },
          { nom: "7S.210", slug: "7s-210", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "5M",
    slug: "5m",
    ordre: 4,
    sousNiveaux: [
      {
        nom: "Dyna-4",
        slug: "dyna-4",
        type: "transmission",
        modeles: [
          { nom: "5M.105", slug: "5m-105", grilles: [], stock: [] },
          { nom: "5M.115", slug: "5m-115", grilles: [], stock: [] },
          { nom: "5M.125", slug: "5m-125", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "8S",
    slug: "8s",
    ordre: 5,
    sousNiveaux: [
      {
        nom: "Dyna E-Power",
        slug: "dyna-e-power",
        type: "transmission",
        modeles: [
          { nom: "8S.205", slug: "8s-205", grilles: [], stock: [] },
          { nom: "8S.265", slug: "8s-265", grilles: [], stock: [] },
          { nom: "8S.305", slug: "8s-305", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "9S",
    slug: "9s",
    ordre: 6,
    sousNiveaux: [
      {
        nom: "Dyna-VT",
        slug: "dyna-vt",
        type: "transmission",
        modeles: [
          { nom: "9S.350", slug: "9s-350", grilles: [], stock: [] },
          { nom: "9S.425", slug: "9s-425", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "3 Speciality",
    slug: "3-speciality",
    ordre: 7,
    sousNiveaux: [
      {
        nom: "VI (vignerons)",
        slug: "vi",
        type: "sous_serie",
        modeles: [
          { nom: "3VI.105", slug: "3vi-105", grilles: [], stock: [] },
          { nom: "3VI.115", slug: "3vi-115", grilles: [], stock: [] },
        ],
      },
      {
        nom: "GE (arboriculture)",
        slug: "ge",
        type: "sous_serie",
        modeles: [{ nom: "3GE.105", slug: "3ge-105", grilles: [], stock: [] }],
      },
    ],
  },
  {
    nom: "Compact",
    slug: "compact",
    ordre: 8,
    sousNiveaux: [
      {
        nom: "1M",
        slug: "1m",
        type: "sous_serie",
        modeles: [
          {
            nom: "1M.25 HP",
            slug: "1m-25",
            prixRetailMf: 17900,
            grilles: [
              {
                regime: "commande",
                etapes: [
                  { type: "pct", valeur: 15, label: "Remise concessionnaire" },
                  { type: "eur", valeur: 5000, label: "Action compact" },
                  { type: "eur", valeur: 1600, label: "Bonus" },
                ],
              },
            ],
            stock: [
              { po: "MF-1M-0912", prixBrut: 25890, config: "Cabine, chargeur, 3e fonction" },
              { po: "MF-1M-0913", prixBrut: 25890, config: "Cabine, relevage avant" },
              { po: "MF-1M-0921", prixBrut: 24500, config: "Arceau, pneus gazon" },
            ],
          },
          { nom: "1M.30", slug: "1m-30", grilles: [], stock: [] },
        ],
      },
      {
        nom: "2M",
        slug: "2m",
        type: "sous_serie",
        modeles: [{ nom: "2M.40", slug: "2m-40", grilles: [], stock: [] }],
      },
    ],
  },
  {
    nom: "TH télescopiques",
    slug: "th-telescopiques",
    ordre: 9,
    sousNiveaux: [
      {
        nom: "Standard",
        slug: "tous",
        type: "aucun",
        modeles: [
          {
            nom: "TH.6534",
            slug: "th-6534",
            grilles: [],
            stock: [{ po: "MF-TH-5501", prixBrut: 112300, config: "6,5 m / 3,4 t, climatisation" }],
          },
          { nom: "TH.7038", slug: "th-7038", grilles: [], stock: [] },
          { nom: "TH.8043", slug: "th-8043", grilles: [], stock: [] },
        ],
      },
    ],
  },
  {
    nom: "4700 M",
    slug: "4700-m",
    ordre: 10,
    sousNiveaux: [
      {
        nom: "Standard",
        slug: "tous",
        type: "aucun",
        modeles: [
          { nom: "4708 M", slug: "4708-m", grilles: [], stock: [] },
          { nom: "4709 M", slug: "4709-m", grilles: [], stock: [] },
          { nom: "4710 M", slug: "4710-m", grilles: [], stock: [] },
        ],
      },
    ],
  },
];

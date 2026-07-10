# Espace `/pro` — Architecture de référence

> **Statut : architecture verrouillée, développement différé.**
> La vitrine publique se lance d'abord (bascule DNS après l'événement du 8 juillet 2026).
> Le build de `/pro` démarre **après** ce lancement (cf. brief §9).
> Ce document est le cahier des charges technique : il fige les décisions avant de coder.

---

## 0. Principe directeur

On **greffe** `/pro` sur le site Next.js existant (App Router, Next 16.2.9 / React 19 / Tailwind v4).
La vitrine publique reste **strictement inchangée et accessible à tous**. Aucune route publique
n'est modifiée. Tout le code `/pro` est isolé sous `app/pro/` et `app/api/pro/`.

Cible : **commerciaux sur mobile, sur le terrain** → mobile-first, 100 % français.
Données **confidentielles** (prix net concessionnaire, marges) → protection sérieuse, vérifiée serveur.

---

## 1. Stack ajoutée (à installer en Phase 0/1, pas avant)

| Brique | Choix | Rôle |
|---|---|---|
| Auth + rôles | **Clerk** (`@clerk/nextjs` v6+) | login, rôles admin/commercial, invitations |
| Base de données | **Neon Postgres** (via marketplace Vercel) | grilles de remises, stock, paramètres |
| Extraction PDF | **API Anthropic** (`@anthropic-ai/sdk`) | ingestion des 5 PDF → JSON structuré |
| UI | **Tailwind v4** (déjà en place) | cohérence avec le prototype |

> ⚠️ « Vercel Postgres » est désormais routé vers **Neon** dans le marketplace Vercel.
> Driver recommandé : `@neondatabase/serverless` (compatible edge/serverless).

### Variables d'environnement (noms seulement — **jamais** committer les valeurs)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=                # injecté par l'intégration Neon/Vercel
ANTHROPIC_API_KEY=
```

---

## 2. Authentification, rôles, confidentialité

### Protection serveur (non négociable)
- `middleware.ts` à la racine, via `clerkMiddleware`, **matcher sur `/pro(.*)` et `/api/pro(.*)`**.
  Un visiteur non authentifié est bloqué **avant le rendu** — il ne voit jamais aucune donnée.
- Les routes publiques (`/`, `/contact`, `/a-propos`, `/evenements`, `/api/contact`) restent ouvertes.
- `/pro` porte `robots: { index:false, follow:false }` (layout) **et** est ajouté en `disallow`
  dans `app/robots.ts`.

### Deux rôles (portés par Clerk `publicMetadata.role`)
| Rôle | Qui | Accès |
|---|---|---|
| `admin` | Olivier | calcul + import PDF + équipe + paramètres + **voit la marge** |
| `commercial` | ex. Pierre | calcul en **consultation seule** |

- Contrôle d'accès **vérifié côté serveur sur chaque action sensible** (server action / route handler),
  jamais seulement masqué à l'écran. Un commercial qui devine `/pro/import` ou `/pro/equipe` est
  rejeté serveur (403/redirect).

### Affichage de la marge (paramètre global admin)
- `marge = prix_retail − prix_net_concessionnaire`. Révèle le prix d'achat réel.
- Réglage global **on/off** dans `/pro/parametres` (admin). **Par défaut : masquée** pour les commerciaux.
- Si masquée : le champ marge **n'est jamais envoyé au client** (filtrage **côté serveur**, pas en CSS).
  Le commercial voit prix net + retail, pas l'écart isolé.

---

## 3. Modèle de données

### Principe : 5 sources indépendantes, « version active par source »
Chaque source a sa propre date d'import. Un nouvel import **écrase la version active de cette source
uniquement**, sans toucher aux autres. **Pas d'historique.**

| Source (`source_type`) | Contenu | Rythme |
|---|---|---|
| `remises_commande` | % et € par modèle (nouvelles commandes) | trimestriel |
| `remises_stock` | % et € par modèle (liste de stock, ≠ commandes) | trimestriel |
| `stock_tracteurs` | machines physiques (PO, brut, config) | hebdomadaire |
| `stock_fenaison` | faucheuses, andaineurs, presses | hebdomadaire |
| `actions` | campagnes conditionnelles datées | ponctuel |

### Arborescence produit (3 niveaux)
`Gamme → Sous-niveau (transmission ou sous-série) → Modèle`

- **Gammes ordonnées par fréquence de vente** (ordre imposé) :
  `5S, 6S, 7S, 5M, 8S, 9S, 3 Speciality, Compact, TH télescopiques, 4700 M`
- **Sous-niveau** = transmission (Dyna-4 / Dyna-6 / Dyna-VT) **ou** sous-série
  (Compact : 1M/1E, 2M/2E ; 3 Speciality : VI/SP/GE/FR/WF/AL).
- Si **un seul** sous-niveau (ou aucun : TH, 4700 M) → **sauter ce niveau** automatiquement.
- ⚠️ **La transmission change les remises** (ex. 7S.165 : 15 % en Dyna-6, 20 % en Dyna-VT).
  **Ne jamais fusionner les transmissions.**

### Schéma (esquisse DDL — à finaliser en Phase 1)
```sql
-- Suivi des imports (version active par source)
CREATE TABLE source_imports (
  id            BIGSERIAL PRIMARY KEY,
  source_type   TEXT NOT NULL,              -- remises_commande | remises_stock | stock_* | actions
  imported_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active     BOOLEAN NOT NULL DEFAULT false,
  note          TEXT
);

CREATE TABLE gammes (
  id        BIGSERIAL PRIMARY KEY,
  nom       TEXT NOT NULL UNIQUE,           -- "7S"
  ordre     INT  NOT NULL                   -- ordre imposé (fréquence de vente)
);

CREATE TABLE sous_niveaux (
  id        BIGSERIAL PRIMARY KEY,
  gamme_id  BIGINT NOT NULL REFERENCES gammes(id),
  nom       TEXT NOT NULL,                  -- "Dyna-VT" | "1M" | NULL
  type      TEXT NOT NULL                   -- transmission | sous_serie
);

CREATE TABLE modeles (
  id             BIGSERIAL PRIMARY KEY,
  gamme_id       BIGINT NOT NULL REFERENCES gammes(id),
  sous_niveau_id BIGINT REFERENCES sous_niveaux(id),  -- nullable
  nom            TEXT NOT NULL                          -- "7S.165"
);

-- Grilles de remises : double régime (stock | commande)
CREATE TABLE grilles_remise (
  id                BIGSERIAL PRIMARY KEY,
  modele_id         BIGINT NOT NULL REFERENCES modeles(id),
  regime            TEXT NOT NULL,          -- stock | commande
  source_import_id  BIGINT NOT NULL REFERENCES source_imports(id)
);

CREATE TABLE etapes_remise (
  id            BIGSERIAL PRIMARY KEY,
  grille_id     BIGINT NOT NULL REFERENCES grilles_remise(id),
  position      INT  NOT NULL,              -- ordre = colonnes du PDF, gauche→droite
  type          TEXT NOT NULL,             -- pct | eur
  valeur        NUMERIC NOT NULL,
  label         TEXT NOT NULL,
  conditionnel  TEXT                        -- NULL | mfguide | chargeur
);

-- Machines physiques en stock
CREATE TABLE machines_stock (
  id                BIGSERIAL PRIMARY KEY,
  modele_id         BIGINT NOT NULL REFERENCES modeles(id),
  po                TEXT NOT NULL,          -- numéro PO
  prix_brut         NUMERIC NOT NULL,
  config            JSONB,                  -- pneus, options, guidage
  source_import_id  BIGINT NOT NULL REFERENCES source_imports(id)
);

-- Prix retail fourni par MF (badge "PRIX MF") ; sinon saisi à la volée (non stocké)
CREATE TABLE prix_retail_mf (
  modele_id   BIGINT PRIMARY KEY REFERENCES modeles(id),
  valeur      NUMERIC NOT NULL
);

-- Actions commerciales (campagnes conditionnelles datées)
CREATE TABLE actions_commerciales (
  id                BIGSERIAL PRIMARY KEY,
  libelle           TEXT NOT NULL,
  conditions        JSONB,
  date_echeance     DATE,
  source_import_id  BIGINT NOT NULL REFERENCES source_imports(id)
);

-- Paramètres globaux
CREATE TABLE parametres (
  cle    TEXT PRIMARY KEY,                  -- "marge_visible_commercial"
  valeur TEXT NOT NULL                      -- "false" par défaut
);
```

> **Disponibilité** = nombre de `machines_stock` par modèle, agrégée aux niveaux supérieurs
> (sous-niveau, gamme) à l'affichage.
> **Publier un import** = créer un `source_imports` actif + insérer ses lignes + désactiver/supprimer
> les lignes de l'ancien import **de la même source** (aucun historique).

---

## 4. Moteur de calcul (cœur — déterministe)

Fonction pure `calculerNet(brut, etapes[], { mfguide, chargeur })` dans `lib/pricing/engine.ts` :
- appliquer les étapes **dans l'ordre `position`**, sur le prix brut courant ;
- `pct` → `courant = courant × (1 − valeur/100)` ;
- `eur` → `courant = courant − valeur` ;
- étape `conditionnelle` non cochée → ignorée.
- Résultat = **prix net concessionnaire**, arrondi à l'entier (tolérance ±1 €).

### Tests de non-régression (acceptance Phase 2)
| Modèle | Brut | Étapes (ordre) | Net attendu | Retail |
|---|---|---|---|---|
| 1M.25 HP | 25 890 | −15 %, −5 000, −1 600 | **15 406** | 17 900 (MF) |
| 6S.155 D6 (Black Ed.) | 168 825 | −11 000, −15 %, −15 000, −10 000 | **109 152** | 117 500 |
| 7S.165 VT (Black Ed.) | 215 690 | −2 000, −20 %, −15 000, −14 500 | **141 452** | 149 900 |

La marge (`retail − net`) est calculée **côté serveur** ; renvoyée au client **selon le rôle + le réglage**.

---

## 5. Parcours commercial (mobile-first)

1. **Gammes** — cartes, ordre imposé, pastille dispo (« N en stock » / « Sur commande »).
2. **Sous-niveau** — transmissions/sous-séries (sauté si un seul).
3. **Modèles** — liste + dispo par modèle.
4. **Fiche modèle** — 2 onglets :
   - **En stock (N)** : machines réelles (config + PO + brut) → sélection → calcul sur brut réel.
     Onglet grisé si 0 stock.
   - **Configurer en neuf** : saisie du brut (configurateur MF), régime `commande`.
5. **Options conditionnelles** (MF Guide / chargeur) cochables si applicables.
6. **Ticket de calcul** : déroulé étape par étape (chaque remise + sous-total courant).
7. **Résultat** : net concessionnaire (toujours) + retail (MF badge ou saisi) + marge (selon réglage).

Fil d'Ariane pour remonter. **À réconcilier avec le prototype `simulateur_remises_mf.jsx`**
(non encore fourni) qui fige la navigation et l'affichage exacts.

---

## 6. Import PDF (admin — `/pro/import`)

```
Admin choisit le type de source + dépose un PDF
   → API Anthropic lit le PDF → JSON structuré (calé sur le schéma §3)
   → ÉCRAN DE VALIDATION (lignes extraites, éditables)
   → admin confirme → publication (remplace la version active de CETTE source)
```

- Extraction **serveur uniquement** (clé API jamais exposée au client). PDF envoyé en *document content block*.
- Sortie **structurée** (JSON / tool use) : gamme, sous-niveau, modèle, étapes ordonnées
  (type/valeur/label/conditionnel) ; pour le stock : PO/brut/config.
- **Écran de validation obligatoire** : rien n'est publié sans clic admin ; correction manuelle possible.
- **Robustesse** : si la mise en page MF change et que l'extraction échoue/paraît douteuse →
  **signaler à l'admin**, ne jamais publier silencieusement.
- Modèle Claude : par défaut **Sonnet 4.6** (`claude-sonnet-4-6`) pour l'extraction documentaire
  (bon rapport coût/qualité) ; basculer sur Opus si la complexité des tableaux l'exige.

---

## 7. Garde-fous métier

- **Black Edition** : prix net client affiché, **non cumulable** → régime à part, signalé.
- **Actions datées** : stocker `date_echeance` ; masquer/marquer une action expirée
  (ex. reprise concurrence échéance 15-06-2026) ; ne jamais appliquer une action périmée.
- **Remises conditionnelles** : MF Guide / chargeur ajoutés seulement si cochés.
- **Net concessionnaire (achat) vs retail (client)** : distinction toujours claire à l'écran.
- **Confidentialité** : marge filtrée serveur selon rôle ; `noindex` ; auth serveur.

---

## 8. Phases de développement (après le 8 juillet — tester à chaque étape)

- **Phase 0 — Socle** : `middleware.ts` Clerk, `app/pro/layout.tsx` (noindex) + `app/pro/page.tsx`
  distinguant admin/commercial, robots disallow. Critère : `/pro` inaccessible sans login,
  vitrine intacte.
- **Phase 1 — Données + navigation** : schéma Neon, seed d'un échantillon (issu du prototype/PDF),
  navigation 3 niveaux avec dispo stock.
- **Phase 2 — Calcul** : moteur séquentiel + fiche modèle (onglets, options, ticket, résultat, marge
  selon rôle). **Passer les 3 tests du §4.**
- **Phase 3 — Import PDF** : `/pro/import`, API Anthropic, écran de validation, publication par source.
- **Phase 4 — Équipe** : `/pro/equipe` (invitation/retrait), `/pro/parametres` (réglage marge).

---

## 9. Prérequis à fournir par Olivier (avant Phase 0)

1. **Clerk** — compte sur clerk.com → application « Agrisem Pro » → activer l'auth e-mail/mot de passe
   → copier les 2 clés → les ajouter dans Vercel (Production + Preview) **et** en local.
2. **Neon Postgres** — Vercel → Storage → Create Database → Neon → lier au projet agrisem
   (injecte `DATABASE_URL` automatiquement).
3. **Anthropic** — console.anthropic.com → API Keys → créer une clé → `ANTHROPIC_API_KEY` dans Vercel + local.
4. **Prototype** — fournir `simulateur_remises_mf.jsx` (réf. UI/navigation/moteur).

> Claude Code ne crée pas les comptes ni ne saisit les clés à ta place (sécurité). Toi seul renseignes
> les valeurs dans les dashboards Vercel/Clerk/Anthropic.

---

## 10. Décisions verrouillées (rappel)
- Greffe sur l'existant, vitrine intacte, `/pro` isolé.
- Auth serveur Clerk + 2 rôles, contrôle serveur sur action sensible.
- Marge masquée par défaut, filtrée serveur.
- 5 sources indépendantes, version active par source, sans historique.
- Arbo 3 niveaux, transmissions jamais fusionnées, double régime stock/commande.
- Moteur déterministe séquentiel validé par 3 cas de non-régression.
- Import PDF avec validation humaine obligatoire.

// Schéma relationnel du catalogue (cf. docs/pro-architecture.md §3).
// Chaque instruction est exécutée séparément (le driver HTTP Neon ne gère pas
// le multi-statement). Idempotent : CREATE TABLE IF NOT EXISTS.

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS gammes (
     id                 SERIAL PRIMARY KEY,
     key                TEXT NOT NULL UNIQUE,
     label              TEXT NOT NULL,
     descr              TEXT NOT NULL DEFAULT '',
     ordre              INT  NOT NULL,
     label_sous_niveau  TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS sous_niveaux (
     id        SERIAL PRIMARY KEY,
     gamme_id  INT  NOT NULL REFERENCES gammes(id) ON DELETE CASCADE,
     key       TEXT NOT NULL,
     label     TEXT NOT NULL DEFAULT '',
     type      TEXT NOT NULL,
     ordre     INT  NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS modeles (
     id              SERIAL PRIMARY KEY,
     sous_niveau_id  INT  NOT NULL REFERENCES sous_niveaux(id) ON DELETE CASCADE,
     nom             TEXT NOT NULL,
     brut_indicatif  NUMERIC,
     prix_retail_mf  NUMERIC,
     ordre           INT  NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS etapes (
     id            SERIAL PRIMARY KEY,
     modele_id     INT  NOT NULL REFERENCES modeles(id) ON DELETE CASCADE,
     regime        TEXT NOT NULL DEFAULT 'commande',
     position      INT  NOT NULL,
     type          TEXT NOT NULL,
     valeur        NUMERIC NOT NULL,
     label         TEXT NOT NULL,
     conditionnel  TEXT
   )`,
  // Double régime (commande ≠ stock) pour les bases déjà créées :
  `ALTER TABLE etapes ADD COLUMN IF NOT EXISTS regime TEXT NOT NULL DEFAULT 'commande'`,
  `CREATE TABLE IF NOT EXISTS machines_stock (
     id          SERIAL PRIMARY KEY,
     modele_id   INT  NOT NULL REFERENCES modeles(id) ON DELETE CASCADE,
     po          TEXT,
     prix_brut   NUMERIC,
     config      TEXT NOT NULL DEFAULT '',
     source      TEXT NOT NULL DEFAULT 'seed'
   )`,
  // Pour les bases déjà créées sans la colonne source :
  `ALTER TABLE machines_stock ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'seed'`,
  // Le prix et le PO peuvent être absents (machines de démo « sur demande ») :
  `ALTER TABLE machines_stock ALTER COLUMN prix_brut DROP NOT NULL`,
  `ALTER TABLE machines_stock ALTER COLUMN po DROP NOT NULL`,
  `CREATE TABLE IF NOT EXISTS settings (
     cle     TEXT PRIMARY KEY,
     valeur  TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS actions (
     id             SERIAL PRIMARY KEY,
     titre          TEXT NOT NULL,
     gammes         TEXT,
     avantage       TEXT,
     date_echeance  DATE,
     conditions     TEXT,
     position       INT NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS documents (
     id            SERIAL PRIMARY KEY,
     titre         TEXT NOT NULL,
     blob_url      TEXT NOT NULL,
     pathname      TEXT NOT NULL,
     taille        BIGINT,
     content_type  TEXT,
     uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
];

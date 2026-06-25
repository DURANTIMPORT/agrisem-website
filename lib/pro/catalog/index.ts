import { GAMMES } from "./seed";
import { db } from "../db";
import type { Gamme, SousNiveau, Modele, EtapeRemise, MachineStock } from "./types";

export type {
  Gamme,
  SousNiveau,
  Modele,
  EtapeRemise,
  MachineStock,
  TypeEtape,
  ConditionEtape,
} from "./types";

const num = (v: unknown): number => Number(v);

/**
 * Catalogue complet. Lu depuis Neon si DATABASE_URL est configurée,
 * sinon repli sur les données d'exemple (seed) — sans planter.
 */
export async function getGammes(): Promise<Gamme[]> {
  const sql = db();
  if (!sql) return [...GAMMES].sort((a, b) => a.ordre - b.ordre);
  return readFromDb(sql);
}

export type CatalogEntry = {
  modeleId: number;
  gammeKey: string;
  gammeLabel: string;
  sousKey: string;
  sousLabel: string;
  nom: string;
};

/** Liste à plat des modèles (pour la correspondance à l'import PDF). */
export async function getCatalogFlat(): Promise<CatalogEntry[]> {
  const sql = db();
  if (!sql) {
    return GAMMES.flatMap((g) =>
      g.sousNiveaux.flatMap((s) =>
        s.modeles.map((m) => ({
          modeleId: -1,
          gammeKey: g.key,
          gammeLabel: g.label,
          sousKey: s.key,
          sousLabel: s.label,
          nom: m.nom,
        }))
      )
    );
  }
  const rows = await sql.query(
    `SELECT m.id, m.nom, s.key AS sous_key, s.label AS sous_label,
            g.key AS gamme_key, g.label AS gamme_label
     FROM modeles m
     JOIN sous_niveaux s ON s.id = m.sous_niveau_id
     JOIN gammes g ON g.id = s.gamme_id
     ORDER BY g.ordre, s.ordre, m.ordre`
  );
  return rows.map((r) => ({
    modeleId: r.id,
    gammeKey: r.gamme_key,
    gammeLabel: r.gamme_label,
    sousKey: r.sous_key,
    sousLabel: r.sous_label,
    nom: r.nom,
  }));
}

async function readFromDb(
  sql: NonNullable<ReturnType<typeof db>>
): Promise<Gamme[]> {
  const [gRows, sRows, mRows, eRows, stRows] = await Promise.all([
    sql.query(`SELECT id,key,label,descr,ordre,label_sous_niveau FROM gammes ORDER BY ordre`),
    sql.query(`SELECT id,gamme_id,key,label,type,ordre FROM sous_niveaux ORDER BY ordre`),
    sql.query(`SELECT id,sous_niveau_id,nom,brut_indicatif,prix_retail_mf,ordre FROM modeles ORDER BY ordre`),
    sql.query(`SELECT id,modele_id,position,type,valeur,label,conditionnel FROM etapes ORDER BY position`),
    sql.query(`SELECT id,modele_id,po,prix_brut,config FROM machines_stock ORDER BY id`),
  ]);

  const modeles = new Map<number, Modele>();
  const modeleParent = new Map<number, number>(); // modeleId → sousNiveauId
  for (const m of mRows) {
    modeles.set(m.id, {
      nom: m.nom,
      etapes: [],
      brutIndicatif: m.brut_indicatif != null ? num(m.brut_indicatif) : undefined,
      prixRetailMf: m.prix_retail_mf != null ? num(m.prix_retail_mf) : undefined,
      stock: [],
    });
    modeleParent.set(m.id, m.sous_niveau_id);
  }

  for (const e of eRows) {
    const mo = modeles.get(e.modele_id);
    if (!mo) continue;
    const etape: EtapeRemise = {
      type: e.type,
      valeur: num(e.valeur),
      label: e.label,
      ...(e.conditionnel ? { conditionnel: e.conditionnel } : {}),
    };
    mo.etapes.push(etape);
  }

  for (const st of stRows) {
    const mo = modeles.get(st.modele_id);
    if (!mo) continue;
    const machine: MachineStock = {
      po: st.po,
      prixBrut: num(st.prix_brut),
      config: st.config,
    };
    mo.stock.push(machine);
  }

  const sous = new Map<number, SousNiveau>();
  const sousParent = new Map<number, number>(); // sousId → gammeId
  for (const s of sRows) {
    sous.set(s.id, { key: s.key, label: s.label, type: s.type, modeles: [] });
    sousParent.set(s.id, s.gamme_id);
  }
  for (const [modeleId, sousId] of modeleParent) {
    sous.get(sousId)?.modeles.push(modeles.get(modeleId)!);
  }

  const gammes: Gamme[] = gRows.map((g) => ({
    key: g.key,
    label: g.label,
    desc: g.descr,
    ordre: g.ordre,
    labelSousNiveau: g.label_sous_niveau,
    sousNiveaux: [],
  }));
  const gammeById = new Map<number, Gamme>();
  gRows.forEach((g, i) => gammeById.set(g.id, gammes[i]));
  for (const [sousId, gammeId] of sousParent) {
    gammeById.get(gammeId)?.sousNiveaux.push(sous.get(sousId)!);
  }

  return gammes;
}

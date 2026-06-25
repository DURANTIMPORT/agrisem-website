import { db } from "./db";

export interface ActionCommerciale {
  titre: string;
  gammes: string | null;
  avantage: string | null;
  dateEcheance: string | null; // "YYYY-MM-DD" ou null (« jusqu'à nouvel ordre »)
  conditions: string | null;
}

/** Actions commerciales (campagnes datées). Vide si pas de base. */
export async function getActions(): Promise<ActionCommerciale[]> {
  const sql = db();
  if (!sql) return [];
  const rows = await sql.query(
    `SELECT titre, gammes, avantage, date_echeance, conditions FROM actions ORDER BY position`
  );
  return rows.map((r) => ({
    titre: r.titre,
    gammes: r.gammes ?? null,
    avantage: r.avantage ?? null,
    dateEcheance: r.date_echeance
      ? new Date(r.date_echeance).toISOString().slice(0, 10)
      : null,
    conditions: r.conditions ?? null,
  }));
}

/** Vrai si l'action est échue (date d'échéance dépassée). */
export function estExpiree(dateEcheance: string | null, aujourdhui = new Date()): boolean {
  if (!dateEcheance) return false;
  const d = new Date(dateEcheance + "T23:59:59");
  return d.getTime() < aujourdhui.getTime();
}

import { db } from "./db";

// Réglages globaux de l'espace /pro, stockés dans la table `settings` (Neon).
// Repli sur les valeurs par défaut si la base n'est pas configurée.
// Cf. docs/pro-architecture.md §2.

const CLE_MARGE = "marge_visible_commercial";

/**
 * La marge (= retail − net) est-elle visible par les commerciaux ?
 * Par défaut FAUX : ils voient le net et le retail, pas l'écart isolé.
 * (Les admins voient toujours la marge — géré côté appelant.)
 */
export async function margeVisibleCommercial(): Promise<boolean> {
  const sql = db();
  if (!sql) return false;
  const rows = await sql.query(`SELECT valeur FROM settings WHERE cle = $1`, [
    CLE_MARGE,
  ]);
  return rows[0]?.valeur === "true";
}

/** Modifie le réglage (réservé à l'admin — à garder côté appelant). */
export async function setMargeVisibleCommercial(visible: boolean): Promise<void> {
  const sql = db();
  if (!sql) return;
  await sql.query(
    `INSERT INTO settings (cle, valeur) VALUES ($1, $2)
     ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur`,
    [CLE_MARGE, visible ? "true" : "false"]
  );
}

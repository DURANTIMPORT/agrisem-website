// Réglages globaux de l'espace /pro.
// Pour l'instant en dur ; seront stockés en base (Neon) et éditables par
// l'admin via /pro/parametres (Phase 4). Cf. docs/pro-architecture.md §2.

/**
 * La marge (= retail − net) est-elle visible par les commerciaux ?
 * Par défaut FAUX : ils voient le net et le retail, pas l'écart isolé.
 * (Les admins voient toujours la marge — géré côté appelant.)
 */
export async function margeVisibleCommercial(): Promise<boolean> {
  return false;
}

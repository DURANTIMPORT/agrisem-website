import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { GAMMES } from "../lib/pro/catalog/seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante dans .env.local");
  const sql = neon(url);

  // Remise à zéro (idempotent)
  await sql.query(
    "TRUNCATE machines_stock, etapes, modeles, sous_niveaux, gammes RESTART IDENTITY CASCADE"
  );

  let nbModeles = 0;
  let nbStock = 0;

  for (const g of GAMMES) {
    const gr = await sql.query(
      `INSERT INTO gammes (key,label,descr,ordre,label_sous_niveau)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [g.key, g.label, g.desc, g.ordre, g.labelSousNiveau ?? null]
    );
    const gammeId = gr[0].id;

    for (const [si, s] of g.sousNiveaux.entries()) {
      const sr = await sql.query(
        `INSERT INTO sous_niveaux (gamme_id,key,label,type,ordre)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [gammeId, s.key, s.label, s.type, si]
      );
      const sousId = sr[0].id;

      for (const [mi, mo] of s.modeles.entries()) {
        const mr = await sql.query(
          `INSERT INTO modeles (sous_niveau_id,nom,brut_indicatif,prix_retail_mf,ordre)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [sousId, mo.nom, mo.brutIndicatif ?? null, mo.prixRetailMf ?? null, mi]
        );
        const modeleId = mr[0].id;
        nbModeles++;

        for (const [ei, e] of mo.etapes.entries()) {
          await sql.query(
            `INSERT INTO etapes (modele_id,position,type,valeur,label,conditionnel)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [modeleId, ei, e.type, e.valeur, e.label, e.conditionnel ?? null]
          );
        }
        for (const mc of mo.stock) {
          await sql.query(
            `INSERT INTO machines_stock (modele_id,po,prix_brut,config)
             VALUES ($1,$2,$3,$4)`,
            [modeleId, mc.po, mc.prixBrut, mc.config]
          );
          nbStock++;
        }
      }
    }
    console.log(`✓ ${g.label}`);
  }

  await sql.query(
    `INSERT INTO settings (cle,valeur) VALUES ('marge_visible_commercial','false')
     ON CONFLICT (cle) DO NOTHING`
  );

  console.log(`\n${GAMMES.length} gammes, ${nbModeles} modèles, ${nbStock} machines en stock importés.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

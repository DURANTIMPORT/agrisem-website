import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { SCHEMA_STATEMENTS } from "../lib/pro/catalog/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquante dans .env.local");
  const sql = neon(url);
  for (const stmt of SCHEMA_STATEMENTS) {
    await sql.query(stmt);
    console.log("✓", stmt.split("(")[0].trim());
  }
  console.log("\nSchéma créé / à jour.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

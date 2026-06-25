"use server";

import Anthropic from "@anthropic-ai/sdk";
import { isAdmin } from "@/lib/pro/roles";
import { db } from "@/lib/pro/db";
import { getCatalogFlat, type CatalogEntry } from "@/lib/pro/catalog";
import type { ImportState, PublishState, MachineExtraite } from "./types";

function stripFences(text: string): string {
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function catalogueTexte(catalog: CatalogEntry[]): string {
  const groupes = new Map<string, { entete: string; noms: string[] }>();
  for (const e of catalog) {
    const k = `${e.gammeKey}|${e.sousKey}`;
    if (!groupes.has(k)) {
      groupes.set(k, {
        entete: `${e.gammeKey}|${e.sousKey} (${e.gammeLabel}${e.sousLabel ? " " + e.sousLabel : ""})`,
        noms: [],
      });
    }
    groupes.get(k)!.noms.push(e.nom);
  }
  return [...groupes.values()]
    .map((g) => `${g.entete} : ${g.noms.join(" / ")}`)
    .join("\n");
}

function resolveur(catalog: CatalogEntry[]) {
  const map = new Map<string, CatalogEntry>();
  for (const e of catalog) map.set(`${e.gammeKey}|${e.sousKey}|${e.nom}`, e);
  return map;
}

export async function extractPdf(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };

  const source = String(formData.get("source") ?? "");
  const file = formData.get("pdf");

  if (!(file instanceof File) || file.size === 0)
    return { error: "Sélectionnez un fichier PDF." };
  if (file.type && file.type !== "application/pdf")
    return { error: "Le fichier doit être un PDF." };
  if (source !== "stock_tracteurs" && source !== "stock_fenaison")
    return { error: "Ce type de source n'est pas encore pris en charge." };
  if (!process.env.ANTHROPIC_API_KEY)
    return { error: "Clé API Anthropic non configurée (ANTHROPIC_API_KEY)." };

  try {
    const catalog = await getCatalogFlat();
    const prompt = `Tu reçois la liste de stock de machines Massey Ferguson (PDF tableau).
Extrais CHAQUE machine. Le tableau a des colonnes "Machine", "Pneus",
"Options", "Configuration", "Price", "Production".

Pour chaque machine, propose aussi sa correspondance dans le CATALOGUE
ci-dessous : choisis le bon groupe (gammeKey|sousKey) et le nom de modèle
EXACT dans la liste de ce groupe. Exemple : "5S.145 D6 EXC" → gammeKey "5S",
sousKey "d6" (Dyna-6), modele "5S.145" (la transmission D6/DVT/D4 indique le
sousKey ; le reste, EXC/30 Years…, est une finition qui reste dans config).
Si aucun modèle ne correspond, mets "match": null.

CATALOGUE :
${catalogueTexte(catalog)}

Réponds UNIQUEMENT avec un objet JSON valide :
{"machines":[{"modele":"5S.145 D6 EXC","po":"9481","prixBrut":188270,"config":"LL004 + FL4124 · 600/65 R38 · RTK","match":{"gammeKey":"5S","sousKey":"d6","modele":"5S.145"}}]}

Règles :
- "prixBrut" : colonne "Price" en euros. Le POINT est un séparateur de
  milliers : "33.338 €" vaut 33338. Nombre ENTIER. Vide → null.
- "config" : résumé pneus + options + configuration + guidage + finition.
- "match.modele" doit être un nom EXACT de la liste du groupe choisi, sinon null.
- N'invente rien. Ignore totaux/en-têtes.`;

    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    type Brut = {
      modele?: string; po?: string; prixBrut?: number; config?: string;
      match?: { gammeKey?: string; sousKey?: string; modele?: string } | null;
    };
    const parsed = JSON.parse(stripFences(text)) as { machines?: Brut[] };
    const brutes = Array.isArray(parsed.machines) ? parsed.machines : [];
    if (brutes.length === 0)
      return { error: "Aucune machine n'a pu être extraite de ce PDF.", source };

    const map = resolveur(catalog);
    const machines: MachineExtraite[] = brutes.map((b) => {
      const m = b.match;
      const entry = m?.gammeKey && m?.sousKey && m?.modele
        ? map.get(`${m.gammeKey}|${m.sousKey}|${m.modele}`)
        : undefined;
      return {
        modele: b.modele ?? null,
        po: b.po ?? null,
        prixBrut: typeof b.prixBrut === "number" ? b.prixBrut : null,
        config: b.config ?? null,
        gammeKey: entry?.gammeKey ?? null,
        sousKey: entry?.sousKey ?? null,
        modeleCatalogue: entry?.nom ?? null,
        matchLabel: entry ? `${entry.gammeLabel} · ${entry.sousLabel || "—"} · ${entry.nom}` : null,
        reconnu: !!entry,
      };
    });

    return { machines, source };
  } catch (e) {
    return {
      error: e instanceof Error ? `Échec de l'extraction : ${e.message}` : "Échec de l'extraction.",
      source,
    };
  }
}

export async function publishStock(
  _prev: PublishState,
  formData: FormData
): Promise<PublishState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };

  const source = String(formData.get("source") ?? "");
  if (source !== "stock_tracteurs" && source !== "stock_fenaison")
    return { error: "Source invalide." };

  const sql = db();
  if (!sql) return { error: "Base de données non configurée." };

  let machines: MachineExtraite[];
  try {
    machines = JSON.parse(String(formData.get("data") ?? "[]"));
  } catch {
    return { error: "Données invalides." };
  }

  // Ré-résolution CÔTÉ SERVEUR (on ne fait pas confiance aux ids du client).
  const map = resolveur(await getCatalogFlat());
  const aPublier = machines
    .map((m) => ({
      m,
      entry:
        m.gammeKey && m.sousKey && m.modeleCatalogue
          ? map.get(`${m.gammeKey}|${m.sousKey}|${m.modeleCatalogue}`)
          : undefined,
    }))
    .filter((x) => x.entry);

  const surDemande = aPublier.filter((x) => x.m.prixBrut == null).length;
  const nonReconnues = machines.filter((m) => !m.reconnu).length;

  try {
    // Remplace le stock de cette source (et nettoie l'échantillon initial).
    await sql.query(`DELETE FROM machines_stock WHERE source = $1 OR source = 'seed'`, [source]);
    for (const { m, entry } of aPublier) {
      await sql.query(
        `INSERT INTO machines_stock (modele_id, po, prix_brut, config, source)
         VALUES ($1,$2,$3,$4,$5)`,
        [entry!.modeleId, m.po, m.prixBrut, m.config ?? "", source]
      );
    }
    const parts = [`${aPublier.length} machine(s) publiée(s)`];
    if (surDemande) parts.push(`dont ${surDemande} démo « sur demande »`);
    if (nonReconnues) parts.push(`${nonReconnues} non reconnue(s) ignorée(s)`);
    return { success: parts.join(" · ") + "." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la publication." };
  }
}

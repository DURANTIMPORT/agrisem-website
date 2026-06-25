"use server";

import Anthropic from "@anthropic-ai/sdk";
import { isAdmin } from "@/lib/pro/roles";
import { db } from "@/lib/pro/db";
import { getCatalogFlat, type CatalogEntry } from "@/lib/pro/catalog";
import type {
  ImportState,
  PublishState,
  MachineExtraite,
  ModeleGrille,
  EtapeExtraite,
  ActionExtraite,
} from "./types";

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
  return [...groupes.values()].map((g) => `${g.entete} : ${g.noms.join(" / ")}`).join("\n");
}

function resolveur(catalog: CatalogEntry[]) {
  const map = new Map<string, CatalogEntry>();
  for (const e of catalog) map.set(`${e.gammeKey}|${e.sousKey}|${e.nom}`, e);
  return map;
}

async function lirePdf(formData: FormData): Promise<File | { error: string }> {
  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) return { error: "Sélectionnez un fichier PDF." };
  if (file.type && file.type !== "application/pdf") return { error: "Le fichier doit être un PDF." };
  return file;
}

// ── Extraction du STOCK (machines) ───────────────────────────────────
async function extractStock(
  data: string,
  source: string,
  catalog: CatalogEntry[]
): Promise<ImportState> {
  const prompt = `Tu reçois la liste de stock de machines Massey Ferguson (PDF tableau).
Extrais CHAQUE machine. Colonnes : "Machine", "Pneus", "Options", "Configuration", "Price".
Pour chaque machine, propose sa correspondance dans le CATALOGUE : gammeKey, sousKey
et le nom de modèle EXACT du groupe (la transmission D6/DVT/D4 donne le sousKey ;
EXC/30 Years… restent dans config). Si aucun match, "match": null.

CATALOGUE :
${catalogueTexte(catalog)}

Réponds UNIQUEMENT en JSON :
{"machines":[{"modele":"5S.145 D6 EXC","po":"9481","prixBrut":188270,"config":"...","match":{"gammeKey":"5S","sousKey":"d6","modele":"5S.145"}}]}
- "prixBrut" : colonne "Price" en euros. Le POINT est un séparateur de milliers
  ("33.338 €" = 33338). Nombre ENTIER. Vide → null.
- "config" : pneus + options + configuration + guidage + finition.
- N'invente rien.`;

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
    const entry =
      m?.gammeKey && m?.sousKey && m?.modele
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
}

// ── Extraction des GRILLES DE REMISES ────────────────────────────────
async function extractGrid(
  data: string,
  source: string,
  catalog: CatalogEntry[]
): Promise<ImportState> {
  const prompt = `Grille de REMISES Massey Ferguson. Pour CHAQUE modèle, extrais les
remises DANS L'ORDRE des colonnes (gauche → droite).
Format COMPACT par modèle : {"m":"<gammeKey>|<sousKey>|<modele EXACT catalogue>","n":"<nom PDF>","e":[[type,valeur,cond,label]]}
- type : "p" = pourcentage, "e" = euros. valeur : nombre (point = milliers, "8.000" = 8000).
- cond : "g" = colonne MF Guide/Trimble, "c" = colonne Chargeur FL, 0 = aucune.
- label : intitulé court de la colonne (ex. "Remise modèle", "Remise", "Remise campagne", "Chargeur").
- Si le modèle n'est pas dans le catalogue : "m":null (mais garde "n").

CATALOGUE (gammeKey|sousKey (libellé) : modèles) :
${catalogueTexte(catalog)}

Réponds UNIQUEMENT en JSON compact :
{"r":[{"m":"7S|vt|7S.180 EXC","n":"7S.180 Dyna-VT","e":[["e",7000,0,"Remise modèle"],["p",20,0,"Remise"],["e",15000,0,"Remise campagne"],["e",2000,"c","Chargeur"]]}]}`;

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 32000,
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
  const res = await stream.finalMessage();
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  type Row = { m: string | null; n?: string; e: [string, number, string | number, string][] };
  const parsed = JSON.parse(stripFences(text)) as { r?: Row[] };
  const rows = Array.isArray(parsed.r) ? parsed.r : [];
  if (rows.length === 0)
    return { error: "Aucune grille n'a pu être extraite de ce PDF.", source };

  const map = resolveur(catalog);
  const modeles: ModeleGrille[] = rows.map((row) => {
    const entry = row.m ? map.get(row.m) : undefined;
    const etapes: EtapeExtraite[] = (row.e ?? []).map(([t, v, c, label]) => ({
      type: t === "p" ? "pct" : "eur",
      valeur: Number(v),
      label: label || (t === "p" ? "Remise" : "Remise"),
      ...(c === "g" ? { conditionnel: "mfguide" as const } : c === "c" ? { conditionnel: "chargeur" as const } : {}),
    }));
    return {
      modele: row.n ?? entry?.nom ?? null,
      gammeKey: entry?.gammeKey ?? null,
      sousKey: entry?.sousKey ?? null,
      modeleCatalogue: entry?.nom ?? null,
      matchLabel: entry ? `${entry.gammeLabel} · ${entry.sousLabel || "—"} · ${entry.nom}` : null,
      reconnu: !!entry,
      etapes,
    };
  });
  return { modeles, source };
}

// ── Extraction des ACTIONS commerciales ──────────────────────────────
async function extractActions(data: string, source: string): Promise<ImportState> {
  const prompt = `Ce PDF "Sales actions" liste des campagnes commerciales Massey Ferguson.
Extrais CHAQUE action / campagne distincte.
Réponds UNIQUEMENT en JSON :
{"actions":[{"titre":"Hunting Campaign 6S & 7S","gammes":"6S et 7S","avantage":"3 000 € net","dateEcheance":"2026-06-15","conditions":"reprise concurrence, stock Belgique"}]}
- "titre" : nom court de l'action.
- "gammes" : gammes/modèles ciblés (texte court).
- "avantage" : la remise ou l'offre (ex. "3 000 € net", "0% sur 5 ans", "prix nets fixes").
- "dateEcheance" : date limite au format YYYY-MM-DD, ou null si non précisée.
- "conditions" : conditions clés (reprise, finance, stock, non cumulable…), texte court.
N'invente rien.`;

  const client = new Anthropic();
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
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
  const parsed = JSON.parse(stripFences(text)) as { actions?: ActionExtraite[] };
  const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
  if (actions.length === 0) return { error: "Aucune action n'a pu être extraite.", source };
  return { actions, source };
}

// ── Point d'entrée extraction ────────────────────────────────────────
export async function extractPdf(_prev: ImportState, formData: FormData): Promise<ImportState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };
  if (!process.env.ANTHROPIC_API_KEY)
    return { error: "Clé API Anthropic non configurée (ANTHROPIC_API_KEY)." };

  const source = String(formData.get("source") ?? "");
  const file = await lirePdf(formData);
  if ("error" in file) return file;

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const catalog = await getCatalogFlat();

  try {
    if (source === "stock_tracteurs" || source === "stock_fenaison")
      return await extractStock(data, source, catalog);
    if (source === "remises_commande" || source === "remises_stock")
      return await extractGrid(data, source, catalog);
    if (source === "actions") return await extractActions(data, source);
    return { error: "Ce type de source n'est pas encore pris en charge." };
  } catch (e) {
    return {
      error: e instanceof Error ? `Échec de l'extraction : ${e.message}` : "Échec de l'extraction.",
      source,
    };
  }
}

// ── Publication du STOCK ─────────────────────────────────────────────
export async function publishStock(_prev: PublishState, formData: FormData): Promise<PublishState> {
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

// ── Publication des GRILLES (par régime) ─────────────────────────────
export async function publishGrid(_prev: PublishState, formData: FormData): Promise<PublishState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };
  const source = String(formData.get("source") ?? "");
  if (source !== "remises_commande" && source !== "remises_stock")
    return { error: "Source invalide." };
  const regime = source === "remises_stock" ? "stock" : "commande";
  const sql = db();
  if (!sql) return { error: "Base de données non configurée." };

  let modeles: ModeleGrille[];
  try {
    modeles = JSON.parse(String(formData.get("data") ?? "[]"));
  } catch {
    return { error: "Données invalides." };
  }

  const map = resolveur(await getCatalogFlat());
  const aPublier = modeles
    .map((m) => ({
      m,
      entry:
        m.gammeKey && m.sousKey && m.modeleCatalogue
          ? map.get(`${m.gammeKey}|${m.sousKey}|${m.modeleCatalogue}`)
          : undefined,
    }))
    .filter((x) => x.entry && x.m.etapes.length > 0);

  const nonReconnues = modeles.filter((m) => !m.reconnu).length;

  try {
    for (const { m, entry } of aPublier) {
      await sql.query(`DELETE FROM etapes WHERE modele_id = $1 AND regime = $2`, [entry!.modeleId, regime]);
      for (const [i, e] of m.etapes.entries()) {
        await sql.query(
          `INSERT INTO etapes (modele_id, regime, position, type, valeur, label, conditionnel)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [entry!.modeleId, regime, i, e.type, e.valeur, e.label, e.conditionnel ?? null]
        );
      }
    }
    const libelle = regime === "stock" ? "liste de stock" : "nouvelles commandes";
    const parts = [`${aPublier.length} grille(s) « ${libelle} » publiée(s)`];
    if (nonReconnues) parts.push(`${nonReconnues} modèle(s) non reconnu(s) ignoré(s)`);
    return { success: parts.join(" · ") + "." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la publication." };
  }
}

// ── Publication des ACTIONS commerciales ─────────────────────────────
export async function publishActions(_prev: PublishState, formData: FormData): Promise<PublishState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };
  const sql = db();
  if (!sql) return { error: "Base de données non configurée." };

  let actions: ActionExtraite[];
  try {
    actions = JSON.parse(String(formData.get("data") ?? "[]"));
  } catch {
    return { error: "Données invalides." };
  }

  try {
    await sql.query(`DELETE FROM actions`);
    for (const [i, a] of actions.entries()) {
      await sql.query(
        `INSERT INTO actions (titre, gammes, avantage, date_echeance, conditions, position)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [a.titre, a.gammes ?? null, a.avantage ?? null, a.dateEcheance || null, a.conditions ?? null, i]
      );
    }
    return { success: `${actions.length} action(s) publiée(s).` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de la publication." };
  }
}

"use server";

import Anthropic from "@anthropic-ai/sdk";
import { isAdmin } from "@/lib/pro/roles";
import type { ImportState, MachineExtraite } from "./types";

const PROMPT_STOCK = `Tu reçois la liste de stock de machines Massey Ferguson (PDF tableau).
Extrais CHAQUE machine présente dans la liste. Réponds UNIQUEMENT avec un objet
JSON valide, sans aucun texte autour, exactement au format :
{"machines":[{"modele":"7S.165 EXC","po":"9388","prixBrut":215380,"config":"650/65 R42 WF · RTK+96"}]}

Règles :
- "modele" : désignation du modèle (ex. "7S.165", "5S.125 EXC", "TH.7038 EFF").
- "po" : numéro de PO / commande, en chaîne.
- "prixBrut" : prix brut en euros, NOMBRE ENTIER, sans symbole ni séparateur de milliers.
- "config" : résumé court (pneus, options, guidage…).
- N'invente aucune donnée. Si une valeur est absente, mets null.
- Ignore les lignes de total, d'en-tête ou non pertinentes.`;

function stripFences(text: string): string {
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export async function extractPdf(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };

  const source = String(formData.get("source") ?? "");
  const file = formData.get("pdf");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionnez un fichier PDF." };
  }
  if (file.type && file.type !== "application/pdf") {
    return { error: "Le fichier doit être un PDF." };
  }
  if (source !== "stock_tracteurs" && source !== "stock_fenaison") {
    return { error: "Ce type de source n'est pas encore pris en charge." };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "Clé API Anthropic non configurée (ANTHROPIC_API_KEY)." };
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const client = new Anthropic();
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data },
            },
            { type: "text", text: PROMPT_STOCK },
          ],
        },
      ],
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const parsed = JSON.parse(stripFences(text)) as { machines?: MachineExtraite[] };
    const machines = Array.isArray(parsed.machines) ? parsed.machines : [];

    if (machines.length === 0) {
      return {
        error:
          "Aucune machine n'a pu être extraite. Vérifie que le PDF correspond bien au type choisi.",
        source,
      };
    }
    return { machines, source };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? `Échec de l'extraction : ${e.message}`
          : "Échec de l'extraction.",
      source,
    };
  }
}

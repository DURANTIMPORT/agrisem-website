"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/pro/roles";
import { db } from "@/lib/pro/db";

export type UploadState = { error?: string; success?: string };

export async function uploadDocument(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  if (!(await isAdmin())) return { error: "Accès réservé aux administrateurs." };
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return { error: "Stockage de fichiers non configuré (BLOB_READ_WRITE_TOKEN)." };

  const titre = String(formData.get("titre") ?? "").trim();
  const file = formData.get("fichier");

  if (!titre) return { error: "Donnez un titre au document." };
  if (!(file instanceof File) || file.size === 0)
    return { error: "Sélectionnez un fichier PDF." };
  if (file.type && file.type !== "application/pdf")
    return { error: "Le fichier doit être un PDF." };

  const sql = db();
  if (!sql) return { error: "Base de données non configurée." };

  try {
    const safe = file.name.replace(/[^\w.\-]/g, "_");
    const blob = await put(`pro-documents/${Date.now()}-${safe}`, file, {
      access: "public",
      contentType: "application/pdf",
    });
    await sql.query(
      `INSERT INTO documents (titre, blob_url, pathname, taille, content_type)
       VALUES ($1,$2,$3,$4,$5)`,
      [titre, blob.url, blob.pathname, file.size, "application/pdf"]
    );
    revalidatePath("/pro/documents");
    return { success: `« ${titre} » ajouté.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'envoi du fichier." };
  }
}

export async function deleteDocument(id: number, blobUrl: string) {
  if (!(await isAdmin())) throw new Error("Accès réservé aux administrateurs.");
  const sql = db();
  if (!sql) throw new Error("Base de données non configurée.");
  try {
    await del(blobUrl);
  } catch {
    // le fichier blob a peut-être déjà disparu — on supprime quand même la ligne
  }
  await sql.query(`DELETE FROM documents WHERE id = $1`, [id]);
  revalidatePath("/pro/documents");
}

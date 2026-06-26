import { db } from "./db";

export interface DocumentPro {
  id: number;
  titre: string;
  blobUrl: string;
  pathname: string;
  taille: number | null;
  contentType: string | null;
  uploadedAt: string;
}

function mapRow(r: Record<string, unknown>): DocumentPro {
  return {
    id: Number(r.id),
    titre: String(r.titre),
    blobUrl: String(r.blob_url),
    pathname: String(r.pathname),
    taille: r.taille != null ? Number(r.taille) : null,
    contentType: (r.content_type as string) ?? null,
    uploadedAt: new Date(r.uploaded_at as string).toISOString(),
  };
}

export async function getDocuments(): Promise<DocumentPro[]> {
  const sql = db();
  if (!sql) return [];
  const rows = await sql.query(
    `SELECT id, titre, blob_url, pathname, taille, content_type, uploaded_at
     FROM documents ORDER BY uploaded_at DESC`
  );
  return rows.map(mapRow);
}

export async function getDocument(id: number): Promise<DocumentPro | null> {
  const sql = db();
  if (!sql || Number.isNaN(id)) return null;
  const rows = await sql.query(
    `SELECT id, titre, blob_url, pathname, taille, content_type, uploaded_at
     FROM documents WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

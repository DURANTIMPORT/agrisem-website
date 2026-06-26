import { get } from "@vercel/blob";
import { getDocument } from "@/lib/pro/documents";

// Route sous /api/pro → protégée par le middleware Clerk (utilisateur connecté).
// Le PDF (stockage Blob PRIVÉ) est récupéré côté serveur via le SDK puis renvoyé
// en flux : il n'est jamais accessible publiquement.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await getDocument(Number(id));
  if (!doc) return new Response("Document introuvable", { status: 404 });

  const res = await get(doc.pathname, { access: "private" });
  if (!res || res.statusCode !== 200 || !res.stream) {
    return new Response("Fichier indisponible", { status: 502 });
  }

  const telecharger = new URL(request.url).searchParams.get("download") === "1";
  const nomFichier = doc.titre.replace(/[^\w.\- ]/g, "_") + ".pdf";

  return new Response(res.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename="${nomFichier}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

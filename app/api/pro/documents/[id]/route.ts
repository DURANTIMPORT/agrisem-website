import { getDocument } from "@/lib/pro/documents";

// Route sous /api/pro → protégée par le middleware Clerk (utilisateur connecté).
// Le PDF est récupéré côté serveur depuis le Blob et renvoyé en flux : l'URL
// réelle du Blob n'est jamais exposée au client.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await getDocument(Number(id));
  if (!doc) return new Response("Document introuvable", { status: 404 });

  const amont = await fetch(doc.blobUrl);
  if (!amont.ok || !amont.body) {
    return new Response("Fichier indisponible", { status: 502 });
  }

  const telecharger = new URL(request.url).searchParams.get("download") === "1";
  const nomFichier = doc.titre.replace(/[^\w.\- ]/g, "_") + ".pdf";

  return new Response(amont.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename="${nomFichier}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

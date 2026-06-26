import { currentUser } from "@clerk/nextjs/server";
import { roleFromUser } from "@/lib/pro/roles";
import { getDocuments } from "@/lib/pro/documents";
import { deleteDocument } from "./actions";
import UploadForm from "./UploadForm";
import DeleteDocButton from "./DeleteDocButton";

export const metadata = { title: "Documents" };

function tailleLisible(o: number | null): string {
  if (o == null) return "";
  if (o < 1024 * 1024) return `${Math.round(o / 1024)} Ko`;
  return `${(o / (1024 * 1024)).toFixed(1)} Mo`;
}

function dateLisible(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function DocumentsPage() {
  const me = await currentUser();
  const admin = roleFromUser(me) === "admin";
  const documents = await getDocuments();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#000002]">Documents</h1>
        <p className="mt-1 text-sm text-[#848689]">
          Tarifs, notices, fiches techniques… à consulter ou télécharger.
        </p>
      </div>

      {admin && <UploadForm />}

      {documents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 text-sm text-[#848689]">
          Aucun document pour le moment.
          {admin ? " Ajoute un PDF ci-dessus." : " Un administrateur en ajoutera bientôt."}
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[#000002]">{doc.titre}</p>
                <p className="text-xs text-[#848689]">
                  PDF{doc.taille ? ` · ${tailleLisible(doc.taille)}` : ""} · ajouté le{" "}
                  {dateLisible(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <a
                  href={`/api/pro/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#000002] underline-offset-2 transition-colors hover:text-[#C71121] hover:underline"
                >
                  Consulter
                </a>
                <a
                  href={`/api/pro/documents/${doc.id}?download=1`}
                  className="rounded-lg bg-[#C71121] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Télécharger
                </a>
                {admin && (
                  <DeleteDocButton remove={deleteDocument.bind(null, doc.id, doc.blobUrl)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

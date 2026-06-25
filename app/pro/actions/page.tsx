import { getActions, estExpiree } from "@/lib/pro/actions";

export const metadata = { title: "Actions commerciales" };

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ActionsPage() {
  const actions = await getActions();
  const actives = actions.filter((a) => !estExpiree(a.dateEcheance));
  const expirees = actions.filter((a) => estExpiree(a.dateEcheance));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#000002]">Actions commerciales</h1>
        <p className="mt-1 text-sm text-[#848689]">
          Campagnes en cours. Les actions expirées sont grisées et ne s&apos;appliquent plus.
        </p>
      </div>

      {actions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 text-sm text-[#848689]">
          Aucune action pour le moment. Un administrateur peut les importer depuis « Import des grilles ».
        </p>
      ) : (
        <>
          {actives.map((a, i) => (
            <Carte key={`a-${i}`} a={a} expiree={false} />
          ))}
          {expirees.length > 0 && (
            <div className="pt-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#848689]">
                Expirées
              </h2>
              {expirees.map((a, i) => (
                <Carte key={`e-${i}`} a={a} expiree />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Carte({
  a,
  expiree,
}: {
  a: Awaited<ReturnType<typeof getActions>>[number];
  expiree: boolean;
}) {
  return (
    <div
      className={`mb-3 rounded-xl border border-black/10 bg-white p-4 ${expiree ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold text-[#000002]">{a.titre}</span>
        {expiree ? (
          <span className="shrink-0 rounded-full bg-black/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#5F6062]">
            Expirée
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-[#e8f6ec] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#1a8a3f]">
            En cours
          </span>
        )}
      </div>
      {(a.gammes || a.avantage) && (
        <p className="mt-1 text-sm text-[#000002]">
          {a.gammes ? `${a.gammes} — ` : ""}
          {a.avantage && <span className="font-semibold text-[#C71121]">{a.avantage}</span>}
        </p>
      )}
      {a.conditions && <p className="mt-1 text-xs text-[#5F6062]">{a.conditions}</p>}
      <p className="mt-2 text-xs text-[#848689]">
        {a.dateEcheance ? `Échéance : ${formatDate(a.dateEcheance)}` : "Sans date limite"}
      </p>
    </div>
  );
}

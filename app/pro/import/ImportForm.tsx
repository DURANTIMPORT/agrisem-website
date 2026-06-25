"use client";

import { useActionState } from "react";
import { extractPdf, publishStock, publishGrid, publishActions } from "./actions";
import { SOURCES, type ImportState, type PublishState, type EtapeExtraite } from "./types";

const initial: ImportState = {};
const initialPub: PublishState = {};

const eur = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("fr-BE").format(n) + " €";

const etapeTexte = (e: EtapeExtraite) =>
  `−${e.type === "pct" ? e.valeur + " %" : eur(e.valeur)}${e.conditionnel ? ` (${e.conditionnel === "mfguide" ? "MF Guide" : "chargeur"})` : ""}`;

export default function ImportForm() {
  const [state, action, pending] = useActionState(extractPdf, initial);
  const [pubS, pubStockAction, pubStockPending] = useActionState(publishStock, initialPub);
  const [pubG, pubGridAction, pubGridPending] = useActionState(publishGrid, initialPub);
  const [pubA, pubActionsAction, pubActionsPending] = useActionState(publishActions, initialPub);

  const machines = state.machines ?? [];
  const modeles = state.modeles ?? [];
  const actions = state.actions ?? [];
  const reconnuesM = machines.filter((m) => m.reconnu).length;
  const reconnuesG = modeles.filter((m) => m.reconnu).length;

  return (
    <div className="space-y-6">
      <form action={action} className="rounded-xl border border-black/10 bg-white p-4">
        <label htmlFor="source" className="block text-sm font-medium text-[#1c1d1f]">
          Type de document
        </label>
        <select
          id="source"
          name="source"
          defaultValue="stock_tracteurs"
          className="mt-2 w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm text-[#1c1d1f] focus:border-[#C71121] focus:outline-none focus:ring-2 focus:ring-[#C71121]/20"
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value} disabled={!s.supporte}>
              {s.label}
              {s.supporte ? "" : " (bientôt)"}
            </option>
          ))}
        </select>

        <label htmlFor="pdf" className="mt-4 block text-sm font-medium text-[#1c1d1f]">
          Fichier PDF
        </label>
        <input
          id="pdf"
          name="pdf"
          type="file"
          accept="application/pdf"
          required
          className="mt-2 block w-full text-sm text-[#5F6062] file:mr-4 file:rounded-lg file:border-0 file:bg-[#C71121] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-[#1c1d1f] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Lecture du PDF par l'IA…" : "Lire le document"}
        </button>
        <p className="mt-2 text-xs text-[#848689]">
          L&apos;IA lit le PDF et propose les données + la correspondance au
          catalogue. Rien n&apos;est enregistré tant que tu n&apos;as pas publié.
        </p>
        {state.error && <p className="mt-3 text-sm font-medium text-[#C71121]">{state.error}</p>}
      </form>

      {/* ── Validation STOCK ── */}
      {machines.length > 0 && (
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-[#1c1d1f]">{machines.length} machine(s) extraite(s)</h2>
          <p className="mb-3 text-xs text-[#848689]">
            {reconnuesM} reconnue(s) · {machines.length - reconnuesM} non reconnue(s).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-[#848689]">
                  <th className="py-2 pr-3">Machine (PDF)</th>
                  <th className="py-2 pr-3">Correspondance</th>
                  <th className="py-2 pr-3">PO</th>
                  <th className="py-2 pr-3">Prix brut</th>
                  <th className="py-2">Config</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m, i) => (
                  <tr key={i} className="border-b border-black/5 align-top">
                    <td className="py-2 pr-3 font-medium text-[#1c1d1f]">{m.modele ?? "—"}</td>
                    <td className="py-2 pr-3">
                      {m.reconnu ? (
                        <span className="text-[#1a8a3f]">{m.matchLabel}</span>
                      ) : (
                        <span className="font-medium text-[#C71121]">Non reconnu</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-[#5F6062]">{m.po ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums text-[#1c1d1f]">{eur(m.prixBrut)}</td>
                    <td className="py-2 text-xs text-[#5F6062]">{m.config ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={pubStockAction} className="mt-4 border-t border-black/10 pt-4">
            <input type="hidden" name="source" value={state.source ?? ""} />
            <input type="hidden" name="data" value={JSON.stringify(machines)} />
            <button
              type="submit"
              disabled={pubStockPending || reconnuesM === 0}
              className="rounded-lg bg-[#C71121] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pubStockPending ? "Publication…" : "Publier dans le catalogue"}
            </button>
            <p className="mt-2 text-xs text-[#848689]">Remplace le stock de cette source.</p>
            {pubS.error && <p className="mt-2 text-sm font-medium text-[#C71121]">{pubS.error}</p>}
            {pubS.success && <p className="mt-2 text-sm font-medium text-[#1a8a3f]">{pubS.success}</p>}
          </form>
        </section>
      )}

      {/* ── Validation GRILLES DE REMISES ── */}
      {modeles.length > 0 && (
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-1 text-sm font-semibold text-[#1c1d1f]">{modeles.length} grille(s) extraite(s)</h2>
          <p className="mb-3 text-xs text-[#848689]">
            {reconnuesG} reconnue(s) · {modeles.length - reconnuesG} non reconnue(s). Seules les
            reconnues seront publiées.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-[#848689]">
                  <th className="py-2 pr-3">Modèle (PDF)</th>
                  <th className="py-2 pr-3">Correspondance</th>
                  <th className="py-2">Remises (dans l&apos;ordre)</th>
                </tr>
              </thead>
              <tbody>
                {modeles.map((m, i) => (
                  <tr key={i} className="border-b border-black/5 align-top">
                    <td className="py-2 pr-3 font-medium text-[#1c1d1f]">{m.modele ?? "—"}</td>
                    <td className="py-2 pr-3">
                      {m.reconnu ? (
                        <span className="text-[#1a8a3f]">{m.matchLabel}</span>
                      ) : (
                        <span className="font-medium text-[#C71121]">Non reconnu</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-[#5F6062]">
                      {m.etapes.map(etapeTexte).join("  ·  ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <form action={pubGridAction} className="mt-4 border-t border-black/10 pt-4">
            <input type="hidden" name="source" value={state.source ?? ""} />
            <input type="hidden" name="data" value={JSON.stringify(modeles)} />
            <button
              type="submit"
              disabled={pubGridPending || reconnuesG === 0}
              className="rounded-lg bg-[#C71121] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pubGridPending ? "Publication…" : "Publier les grilles"}
            </button>
            <p className="mt-2 text-xs text-[#848689]">
              Remplace les remises des modèles reconnus pour ce régime
              (commande ou stock).
            </p>
            {pubG.error && <p className="mt-2 text-sm font-medium text-[#C71121]">{pubG.error}</p>}
            {pubG.success && <p className="mt-2 text-sm font-medium text-[#1a8a3f]">{pubG.success}</p>}
          </form>
        </section>
      )}

      {/* ── Validation ACTIONS commerciales ── */}
      {actions.length > 0 && (
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#1c1d1f]">
            {actions.length} action(s) extraite(s)
          </h2>
          <div className="space-y-3">
            {actions.map((a, i) => (
              <div key={i} className="rounded-lg border border-black/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-[#1c1d1f]">{a.titre}</span>
                  <span className="shrink-0 text-xs text-[#848689]">
                    {a.dateEcheance ? `échéance ${a.dateEcheance}` : "sans date"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#1c1d1f]">
                  {a.gammes ? `${a.gammes} — ` : ""}
                  <span className="font-semibold text-[#C71121]">{a.avantage ?? ""}</span>
                </p>
                {a.conditions && <p className="mt-1 text-xs text-[#5F6062]">{a.conditions}</p>}
              </div>
            ))}
          </div>
          <form action={pubActionsAction} className="mt-4 border-t border-black/10 pt-4">
            <input type="hidden" name="data" value={JSON.stringify(actions)} />
            <button
              type="submit"
              disabled={pubActionsPending}
              className="rounded-lg bg-[#C71121] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pubActionsPending ? "Publication…" : "Publier les actions"}
            </button>
            <p className="mt-2 text-xs text-[#848689]">Remplace la liste des actions commerciales.</p>
            {pubA.error && <p className="mt-2 text-sm font-medium text-[#C71121]">{pubA.error}</p>}
            {pubA.success && <p className="mt-2 text-sm font-medium text-[#1a8a3f]">{pubA.success}</p>}
          </form>
        </section>
      )}
    </div>
  );
}

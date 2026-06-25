"use client";

import { useActionState } from "react";
import { extractPdf } from "./actions";
import { SOURCES, type ImportState } from "./types";

const initial: ImportState = {};

const eur = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("fr-BE").format(n) + " €";

export default function ImportForm() {
  const [state, action, pending] = useActionState(extractPdf, initial);

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
          L&apos;IA lit le PDF et propose les données extraites. Rien n&apos;est
          enregistré tant que tu n&apos;as pas validé.
        </p>

        {state.error && (
          <p className="mt-3 text-sm font-medium text-[#C71121]">{state.error}</p>
        )}
      </form>

      {state.machines && state.machines.length > 0 && (
        <section className="rounded-xl border border-black/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1c1d1f]">
              {state.machines.length} machine(s) extraite(s) — à vérifier
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-[#848689]">
                  <th className="py-2 pr-3">Modèle</th>
                  <th className="py-2 pr-3">PO</th>
                  <th className="py-2 pr-3">Prix brut</th>
                  <th className="py-2">Config</th>
                </tr>
              </thead>
              <tbody>
                {state.machines.map((m, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-2 pr-3 font-medium text-[#1c1d1f]">{m.modele ?? "—"}</td>
                    <td className="py-2 pr-3 text-[#5F6062]">{m.po ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums text-[#1c1d1f]">{eur(m.prixBrut)}</td>
                    <td className="py-2 text-[#5F6062]">{m.config ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-lg bg-black/5 p-3 text-center text-xs text-[#848689]">
            La publication dans la base (remplacement du stock) arrive juste après —
            on valide d&apos;abord la qualité de l&apos;extraction.
          </p>
        </section>
      )}
    </div>
  );
}

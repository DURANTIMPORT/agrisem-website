"use client";

import { useMemo, useState } from "react";
import type { Modele, GrilleRemise } from "@/lib/pro/catalog";
import { calculerNet, calculerMarge, type OptionsCalcul } from "@/lib/pro/pricing/engine";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

type Onglet = "stock" | "neuf";

export default function FicheCalcul({
  modele,
  margeVisible,
}: {
  modele: Modele;
  margeVisible: boolean;
}) {
  const aDuStock = modele.stock.length > 0;
  const [onglet, setOnglet] = useState<Onglet>(aDuStock ? "stock" : "neuf");
  const [machineIdx, setMachineIdx] = useState(0);
  const [brutSaisi, setBrutSaisi] = useState("");
  const [retailSaisi, setRetailSaisi] = useState("");
  const [options, setOptions] = useState<OptionsCalcul>({});

  const grilleStock = modele.grilles.find((g) => g.regime === "stock");
  const grilleCommande = modele.grilles.find((g) => g.regime === "commande");
  const grille: GrilleRemise | undefined =
    onglet === "stock" ? grilleStock : grilleCommande;

  const brut =
    onglet === "stock"
      ? modele.stock[machineIdx]?.prixBrut ?? null
      : brutSaisi
        ? Number(brutSaisi)
        : null;

  // Options conditionnelles présentes dans la grille active
  const conditionnels = useMemo(() => {
    const set = new Set<"mfguide" | "chargeur">();
    grille?.etapes.forEach((e) => {
      if (e.conditionnel) set.add(e.conditionnel);
    });
    return set;
  }, [grille]);

  const resultat =
    grille && brut != null && !Number.isNaN(brut) && brut > 0
      ? calculerNet(brut, grille.etapes, options)
      : null;

  const retailMf = modele.prixRetailMf ?? null;
  const retail =
    retailMf != null ? retailMf : retailSaisi ? Number(retailSaisi) : null;
  const marge = resultat ? calculerMarge(resultat.net, retail) : null;

  const ongletClasses = (actif: boolean) =>
    `flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
      actif ? "bg-navy text-white" : "bg-black/5 text-navy-dark/60"
    }`;

  return (
    <div className="mt-5 space-y-5">
      {/* Onglets */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => aDuStock && setOnglet("stock")}
          disabled={!aDuStock}
          className={`${ongletClasses(onglet === "stock")} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          En stock ({modele.stock.length})
        </button>
        <button
          type="button"
          onClick={() => setOnglet("neuf")}
          className={ongletClasses(onglet === "neuf")}
        >
          Configurer en neuf
        </button>
      </div>

      {/* Choix de la machine (onglet stock) */}
      {onglet === "stock" && aDuStock && (
        <div className="space-y-2">
          {modele.stock.map((m, i) => (
            <button
              type="button"
              key={m.po}
              onClick={() => setMachineIdx(i)}
              className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-colors ${
                i === machineIdx
                  ? "border-gold bg-gold/5"
                  : "border-black/10 bg-white"
              }`}
            >
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wider text-gold">
                  PO {m.po}
                </span>
                <span className="mt-1 block text-sm text-navy-dark/70">
                  {m.config}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-navy-dark">
                {eur(m.prixBrut)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Saisie du prix brut (onglet neuf) */}
      {onglet === "neuf" && (
        <div>
          <label htmlFor="brut" className="block text-sm font-medium text-navy-dark">
            Prix brut (configurateur MF) <span className="text-gold">*</span>
          </label>
          <input
            id="brut"
            type="number"
            inputMode="numeric"
            value={brutSaisi}
            onChange={(e) => setBrutSaisi(e.target.value)}
            placeholder="ex. 150000"
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-navy-dark shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      )}

      {/* Prix retail (saisi si pas de prix MF) */}
      {retailMf == null && (
        <div>
          <label htmlFor="retail" className="block text-sm font-medium text-navy-dark">
            Prix client (retail)
          </label>
          <input
            id="retail"
            type="number"
            inputMode="numeric"
            value={retailSaisi}
            onChange={(e) => setRetailSaisi(e.target.value)}
            placeholder="optionnel — pour calculer la marge"
            className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-navy-dark shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      )}

      {/* Options conditionnelles */}
      {conditionnels.size > 0 && (
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-navy-dark">Équipements</p>
          {conditionnels.has("mfguide") && (
            <label className="flex items-center gap-3 py-1 text-sm text-navy-dark/80">
              <input
                type="checkbox"
                checked={!!options.mfguide}
                onChange={(e) => setOptions((o) => ({ ...o, mfguide: e.target.checked }))}
                className="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold/30"
              />
              MF Guide
            </label>
          )}
          {conditionnels.has("chargeur") && (
            <label className="flex items-center gap-3 py-1 text-sm text-navy-dark/80">
              <input
                type="checkbox"
                checked={!!options.chargeur}
                onChange={(e) => setOptions((o) => ({ ...o, chargeur: e.target.checked }))}
                className="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold/30"
              />
              Chargeur
            </label>
          )}
        </div>
      )}

      {/* Ticket de calcul + résultat */}
      {!grille ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 text-sm text-navy-dark/50">
          Grille de remises non disponible pour ce modèle dans ce régime.
        </p>
      ) : resultat == null ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 text-sm text-navy-dark/50">
          {onglet === "neuf"
            ? "Saisissez un prix brut pour lancer le calcul."
            : "Sélectionnez une machine."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-navy-dark/60">Prix brut</span>
            <span className="font-medium text-navy-dark">{eur(resultat.brut)}</span>
          </div>
          {resultat.lignes.map((l, i) => (
            <div
              key={i}
              className={`flex items-center justify-between border-t border-black/5 px-4 py-2.5 text-sm ${
                l.ignoree ? "opacity-40" : ""
              }`}
            >
              <span className="text-navy-dark/70">
                {l.label}
                {l.ignoree && " (non appliqué)"}
              </span>
              <span className="text-right">
                <span className="block text-red-600">
                  {l.ignoree
                    ? "—"
                    : `− ${l.type === "pct" ? `${l.valeur}%` : eur(l.valeur)}`}
                </span>
                <span className="block text-xs text-navy-dark/50">
                  {eur(l.sousTotal)}
                </span>
              </span>
            </div>
          ))}

          <div className="border-t border-black/10 bg-navy px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Prix net concessionnaire</span>
              <span className="text-xl font-semibold">{eur(resultat.net)}</span>
            </div>
            {retail != null && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-white/70">
                  Prix retail {retailMf != null && "(MF)"}
                </span>
                <span>{eur(retail)}</span>
              </div>
            )}
            {margeVisible && marge != null && (
              <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-2 text-sm">
                <span className="text-gold">Marge</span>
                <span className="font-semibold text-gold">
                  {eur(marge)}
                  {retail ? ` (${Math.round((marge / retail) * 100)}%)` : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

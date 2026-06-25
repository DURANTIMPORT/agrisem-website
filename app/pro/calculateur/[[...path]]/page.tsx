import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  getGammes,
  getGamme,
  getSousNiveau,
  getModele,
  sauterSousNiveau,
  sousNiveauUnique,
  stockGamme,
  stockSousNiveau,
  stockModele,
} from "@/lib/pro/catalog";
import type { Modele, SousNiveau } from "@/lib/pro/catalog";
import { roleFromUser } from "@/lib/pro/roles";
import { margeVisibleCommercial } from "@/lib/pro/settings";
import FicheCalcul from "@/components/pro/FicheCalcul";

const BASE = "/pro/calculateur";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

function StockBadge({ n }: { n: number }) {
  if (n > 0) {
    return (
      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
        {n} en stock
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-navy-dark/50">
      Sur commande
    </span>
  );
}

function Fil({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-navy-dark/50">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1">
          {it.href ? (
            <Link href={it.href} className="hover:text-gold">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-navy-dark">{it.label}</span>
          )}
          {i < items.length - 1 && <span className="px-0.5">›</span>}
        </span>
      ))}
    </nav>
  );
}

function CarteLien({
  href,
  titre,
  stock,
}: {
  href: string;
  titre: string;
  stock: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-gold"
    >
      <span className="font-semibold text-navy-dark">{titre}</span>
      <span className="flex items-center gap-2">
        <StockBadge n={stock} />
        <span className="text-navy-dark/30">›</span>
      </span>
    </Link>
  );
}

function ListeModeles({
  modeles,
  hrefBase,
}: {
  modeles: Modele[];
  hrefBase: string;
}) {
  return (
    <div className="space-y-3">
      {modeles.map((m) => (
        <CarteLien
          key={m.slug}
          href={`${hrefBase}/${m.slug}`}
          titre={m.nom}
          stock={stockModele(m)}
        />
      ))}
    </div>
  );
}

export default async function CalculateurPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;

  // ── Niveau 1 : Gammes ───────────────────────────────────────────────
  if (path.length === 0) {
    const gammes = getGammes();
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-2xl font-semibold text-navy-dark">
          Calculateur de remises
        </h1>
        <p className="mb-5 text-sm text-navy-dark/60">
          Choisissez une gamme Massey Ferguson.
        </p>
        <div className="space-y-3">
          {gammes.map((g) => (
            <CarteLien
              key={g.slug}
              href={`${BASE}/${g.slug}`}
              titre={g.nom}
              stock={stockGamme(g)}
            />
          ))}
        </div>
      </div>
    );
  }

  const gamme = getGamme(path[0]);
  if (!gamme) notFound();

  // ── Niveau 2 : Sous-niveaux (ou modèles si un seul sous-niveau) ──────
  if (path.length === 1) {
    if (sauterSousNiveau(gamme)) {
      const sn = sousNiveauUnique(gamme);
      if (!sn) notFound();
      return (
        <div className="mx-auto max-w-md">
          <Fil items={[{ label: "Gammes", href: BASE }, { label: gamme.nom }]} />
          <h1 className="mb-5 text-2xl font-semibold text-navy-dark">
            {gamme.nom}
          </h1>
          <ListeModeles
            modeles={sn.modeles}
            hrefBase={`${BASE}/${gamme.slug}/${sn.slug}`}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-md">
        <Fil items={[{ label: "Gammes", href: BASE }, { label: gamme.nom }]} />
        <h1 className="mb-1 text-2xl font-semibold text-navy-dark">
          {gamme.nom}
        </h1>
        <p className="mb-5 text-sm text-navy-dark/60">
          Choisissez la transmission.
        </p>
        <div className="space-y-3">
          {gamme.sousNiveaux.map((sn: SousNiveau) => (
            <CarteLien
              key={sn.slug}
              href={`${BASE}/${gamme.slug}/${sn.slug}`}
              titre={sn.nom}
              stock={stockSousNiveau(sn)}
            />
          ))}
        </div>
      </div>
    );
  }

  const sn = getSousNiveau(gamme, path[1]);
  if (!sn) notFound();

  // ── Niveau 3 : Modèles ──────────────────────────────────────────────
  if (path.length === 2) {
    return (
      <div className="mx-auto max-w-md">
        <Fil
          items={[
            { label: "Gammes", href: BASE },
            { label: gamme.nom, href: `${BASE}/${gamme.slug}` },
            { label: sn.nom },
          ]}
        />
        <h1 className="mb-5 text-2xl font-semibold text-navy-dark">
          {gamme.nom} · {sn.nom}
        </h1>
        <ListeModeles
          modeles={sn.modeles}
          hrefBase={`${BASE}/${gamme.slug}/${sn.slug}`}
        />
      </div>
    );
  }

  // ── Fiche modèle + calcul ───────────────────────────────────────────
  if (path.length === 3) {
    const modele = getModele(sn, path[2]);
    if (!modele) notFound();
    const sauteSn = sauterSousNiveau(gamme);

    // Visibilité de la marge décidée CÔTÉ SERVEUR (jamais masquée seulement en CSS).
    const role = roleFromUser(await currentUser());
    const margeVisible = role === "admin" || (await margeVisibleCommercial());

    return (
      <div className="mx-auto max-w-md">
        <Fil
          items={[
            { label: "Gammes", href: BASE },
            { label: gamme.nom, href: `${BASE}/${gamme.slug}` },
            ...(sauteSn
              ? []
              : [{ label: sn.nom, href: `${BASE}/${gamme.slug}/${sn.slug}` }]),
            { label: modele.nom },
          ]}
        />
        <h1 className="text-2xl font-semibold text-navy-dark">{modele.nom}</h1>

        {modele.prixRetailMf != null && (
          <p className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-navy-dark">
              Prix MF
            </span>
            <span className="text-navy-dark/80">
              {eur(modele.prixRetailMf)}
            </span>
          </p>
        )}

        <FicheCalcul modele={modele} margeVisible={margeVisible} />
      </div>
    );
  }

  notFound();
}

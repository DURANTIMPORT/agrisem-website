import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

const DESCRIPTION =
  "Retrouvez Agrisem S.A. sur les foires et salons agricoles de la région. Venez découvrir nos marques Massey Ferguson, Merlo, Kuhn, Takeuchi et Giant.";

export const metadata: Metadata = {
  title: "Événements",
  description: DESCRIPTION,
  alternates: {
    canonical: "/evenements",
  },
  openGraph: {
    title: `Événements | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/evenements",
  },
};

export default function EvenementsPage() {
  return (
    <main className="flex-1">
      <section className="bg-navy px-6 py-20 text-center text-white sm:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Événements
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          Retrouvez-nous sur les foires et salons de la région pour
          découvrir notre gamme et rencontrer notre équipe.
        </p>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl space-y-12">

          {/* Foire de Libramont — carte deux colonnes */}
          <div className="overflow-hidden rounded-2xl border border-black/10 shadow-sm">
            <div className="flex flex-col sm:flex-row">

              {/* Colonne gauche : logo + lieu sur fond marine */}
              <div className="flex shrink-0 flex-col items-center justify-center gap-5 bg-navy px-10 py-10 sm:w-56">
                <Image
                  src="/events/libramont-100ans.png"
                  alt="Foire de Libramont — 100 ans"
                  width={1772}
                  height={1772}
                  className="h-44 w-44 object-contain"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white">
                    Libramont-Chevigny
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-widest text-white/60">
                    Belgique
                  </p>
                </div>
              </div>

              {/* Colonne droite : contenu */}
              <div className="bg-white px-8 py-8">
                <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy-dark">
                  À venir
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-navy-dark">
                  Foire de Libramont
                </h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold">
                  24 – 27 juillet 2026
                </p>

                <div className="mt-5 space-y-3 text-navy-dark/80">
                  <p>
                    Agrisem S.A. sera présent à la{" "}
                    <a
                      href="https://www.foiresdelibramont.be"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-navy-dark underline hover:text-gold"
                    >
                      Foire de Libramont
                    </a>
                    , le plus grand salon agricole de Wallonie et l&apos;un des
                    plus importants d&apos;Europe, qui célèbre cette année son{" "}
                    <strong className="font-semibold text-navy-dark">
                      100e anniversaire
                    </strong>.
                  </p>
                  <p>
                    Nos collaborateurs seront présents sur les stands de nos
                    partenaires et seront là pour vous accueillir, répondre à
                    toutes vos questions et vous présenter nos machines en
                    démonstration.
                  </p>
                  <p>
                    Retrouvez-y nos marques : Massey Ferguson, Merlo, Kuhn,
                    Takeuchi et Giant.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy-dark transition-transform duration-300 hover:scale-105"
                  >
                    Nous contacter pour plus d&apos;informations
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-navy-dark/50">
            D&apos;autres événements seront annoncés prochainement.
          </p>

        </div>
      </section>
    </main>
  );
}

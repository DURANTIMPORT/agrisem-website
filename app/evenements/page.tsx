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
          découvrir nos machines en démonstration et rencontrer notre équipe.
        </p>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-12">

          {/* Foire de Libramont */}
          <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">

            {/* En-tête : logo + titre */}
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <Image
                src="/events/libramont-100ans.png"
                alt="Foire de Libramont — 100 ans"
                width={1772}
                height={1772}
                className="h-28 w-28 shrink-0 object-contain sm:h-32 sm:w-32"
              />
              <div>
                <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wider text-navy-dark">
                  À venir
                </span>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy-dark">
                  Foire de Libramont
                </h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold">
                  24 – 27 juillet 2026 · Libramont-Chevigny, Belgique
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-navy-dark/80">
              <p>
                Agrisem S.A. sera présent à la Foire de Libramont, le plus
                grand salon agricole de Wallonie et l&apos;un des plus importants
                d&apos;Europe, qui fête cette année son{" "}
                <strong className="font-semibold text-navy-dark">100e anniversaire</strong>.
              </p>
              <p>
                Nos collaborateurs seront présents sur les stands de nos
                partenaires et seront là pour vous accueillir, répondre à
                toutes vos questions et vous présenter nos machines en
                démonstration.
              </p>
              <p>
                Vous pourrez y retrouver nos marques partenaires : Massey
                Ferguson, Merlo, Kuhn, Takeuchi et Giant.
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

          <p className="text-center text-sm text-navy-dark/50">
            D&apos;autres événements seront annoncés prochainement.
          </p>

        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

const DESCRIPTION =
  "Depuis 1992, Agrisem S.A. est le concessionnaire de matériel agricole, de manutention et de chantier basé à Daussois (Belgique), partenaire Massey Ferguson, Merlo, Kuhn, Takeuchi et Giant.";

export const metadata: Metadata = {
  title: "À propos",
  description: DESCRIPTION,
  alternates: {
    canonical: "/a-propos",
  },
  openGraph: {
    title: `À propos | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/a-propos",
  },
};

const brands = [
  {
    name: "Massey Ferguson",
    tagline: "Tracteurs & matériel agricole",
    href: "https://www.masseyferguson.com/fr_fr.html",
    description:
      "Tracteurs et machines agricoles reconnus pour leur fiabilité, leur confort et leurs performances au champ.",
  },
  {
    name: "Merlo",
    tagline: "Chargeurs télescopiques",
    href: "https://www.merlo.com/bel/fr/",
    description:
      "Leader mondial des chargeurs télescopiques pour l'agriculture, le bâtiment et l'industrie.",
  },
  {
    name: "Kuhn",
    tagline: "Fenaison & fertilisation",
    href: "https://www.kuhn.fr",
    description:
      "Matériel de travail du sol, de semis, de fertilisation et de récolte des fourrages.",
  },
  {
    name: "Takeuchi",
    tagline: "Engins de chantier",
    href: "https://www.takeuchibenelux.com/fr/",
    description:
      "Mini-pelles et chargeuses compactes pour tous les chantiers, alliant robustesse et précision.",
  },
  {
    name: "Giant",
    tagline: "Chargeurs compacts",
    href: "https://configurator.tobroco-giant.com/fr/produits/g1200-tele",
    description:
      "Chargeurs articulés et télescopiques compacts, polyvalents pour l'agriculture et les espaces verts.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="bg-navy px-6 py-20 text-center text-white sm:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          À propos d&apos;Agrisem S.A.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          Depuis 1992, nous sommes le partenaire de confiance des
          agriculteurs et des entrepreneurs de la région de Daussois pour
          leur matériel agricole, de manutention et de chantier.
        </p>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy-dark">
              Notre histoire
            </h2>
            <p className="mt-4 text-navy-dark/80">
              Fondée en 1992, Agrisem S.A. accompagne depuis plus de trente
              ans les exploitations agricoles, les éleveurs et les
              entreprises de travaux publics de la région. Au fil des
              années, notre concession s&apos;est développée pour proposer
              une offre complète : vente de matériel neuf et d&apos;occasion,
              entretien, réparation et fourniture de pièces détachées.
            </p>
            <p className="mt-4 text-navy-dark/80">
              Cette expérience de terrain et notre proximité avec nos clients
              restent au cœur de notre savoir-faire, pour vous conseiller le
              matériel le plus adapté à votre exploitation ou à votre
              chantier.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy-dark">
              Nos marques partenaires
            </h2>
            <div className="mt-6 space-y-6">
              {brands.map((brand) => (
                <div key={brand.name}>
                  <h3 className="text-xl font-semibold text-navy-dark">
                    <a
                      href={brand.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-gold"
                    >
                      {brand.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-gold">
                    {brand.tagline}
                  </p>
                  <p className="mt-1 text-navy-dark/70">{brand.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy-dark">
              Notre zone d&apos;intervention
            </h2>
            <p className="mt-4 text-navy-dark/80">
              Basés Rue de Villers 21 à 5630 Daussois, en Belgique, nous
              intervenons auprès des professionnels de l&apos;agriculture, de
              l&apos;élevage, des espaces verts et de la construction dans
              les provinces de Namur et du Hainaut, ainsi que le nord de la France. Notre atelier et
              notre équipe technique se déplacent également chez vous pour
              l&apos;entretien et les réparations.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-white transition-transform duration-300 hover:scale-105"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

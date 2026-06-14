import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { SITE_NAME } from "@/lib/site-config";

const DESCRIPTION =
  "Contactez Agrisem S.A. à Daussois (Belgique) pour vos demandes de devis, pièces détachées ou service après-vente sur les marques Massey Ferguson, Merlo, Kuhn, Takeuchi et Giant.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: `Contact | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="bg-navy px-6 py-20 text-center text-white sm:py-28">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Contactez-nous
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          Une question sur nos marques, une demande de devis, de pièces
          détachées ou de service après-vente ? Laissez-nous vos coordonnées,
          notre équipe vous répond dans les plus brefs délais.
        </p>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

import ContactForm from "@/components/ContactForm";

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

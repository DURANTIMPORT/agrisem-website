"use client";

import { useState, type FormEvent } from "react";

const countries = [
  "Belgique",
  "France",
  "Luxembourg",
  "Pays-Bas",
  "Allemagne",
  "Royaume-Uni",
  "Irlande",
  "Suisse",
  "Autriche",
  "Italie",
  "Espagne",
  "Portugal",
  "Pologne",
  "République tchèque",
  "Danemark",
  "Suède",
  "Norvège",
  "Finlande",
  "Grèce",
  "Hongrie",
  "Roumanie",
  "Bulgarie",
  "Croatie",
  "Slovénie",
  "Slovaquie",
  "Estonie",
  "Lettonie",
  "Lituanie",
  "Autre",
];

type Status = "idle" | "loading" | "success" | "error";

const inputClasses =
  "mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-navy-dark shadow-sm transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

const labelClasses = "block text-sm font-medium text-navy-dark";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      prenom: data.get("prenom"),
      nom: data.get("nom"),
      codePostal: data.get("codePostal"),
      pays: data.get("pays"),
      email: data.get("email"),
      telephone: data.get("telephone"),
      message: data.get("message"),
      rgpd: data.get("rgpd") === "on",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-navy-dark">
          Merci pour votre message !
        </h2>
        <p className="mt-3 text-navy-dark/70">
          Votre demande a bien été envoyée à notre équipe. Nous vous
          répondrons dans les plus brefs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className={labelClasses}>
            Prénom <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            required
            autoComplete="given-name"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="nom" className={labelClasses}>
            Nom <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            autoComplete="family-name"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="codePostal" className={labelClasses}>
            Code postal <span className="text-gold">*</span>
          </label>
          <input
            type="text"
            id="codePostal"
            name="codePostal"
            required
            autoComplete="postal-code"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="pays" className={labelClasses}>
            Pays <span className="text-gold">*</span>
          </label>
          <select
            id="pays"
            name="pays"
            required
            defaultValue="Belgique"
            autoComplete="country-name"
            className={inputClasses}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            Adresse e-mail <span className="text-gold">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="telephone" className={labelClasses}>
            Numéro de téléphone <span className="text-gold">*</span>
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            required
            autoComplete="tel"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClasses}>
          Votre message <span className="text-gold">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${inputClasses} resize-none`}
          placeholder="Décrivez votre demande : devis, pièces détachées, service après-vente, information sur un modèle..."
        />
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fdf3e7] p-6 text-sm text-navy-dark/80">
        <h3 className="text-base font-semibold text-navy-dark">
          Protection de vos données personnelles (RGPD)
        </h3>
        <p className="mt-3">
          Agrisem S.A., dont le siège est situé Rue de Villers 21, 5630
          Cerfontaine (Belgique), agit en tant que responsable du traitement
          des données collectées via ce formulaire.
        </p>
        <p className="mt-2">
          Les informations transmises (nom, prénom, adresse postale, adresse
          e-mail, numéro de téléphone et contenu de votre message) sont
          utilisées exclusivement pour traiter votre demande de contact et
          vous répondre au mieux. Elles ne sont en aucun cas cédées, louées ou
          transmises à des tiers à des fins commerciales.
        </p>
        <p className="mt-2">
          Ces données sont conservées pendant la durée nécessaire au
          traitement de votre demande et sont ensuite supprimées ou archivées
          conformément à nos obligations légales. Conformément au Règlement
          (UE) 2016/679 relatif à la protection des données (RGPD), vous
          disposez d&apos;un droit d&apos;accès, de rectification, de
          limitation, d&apos;opposition et d&apos;effacement de vos données.
          Vous pouvez exercer ces droits à tout moment en nous écrivant à{" "}
          <a
            href="mailto:info@agrisem.be"
            className="font-medium text-navy-dark underline hover:text-gold"
          >
            info@agrisem.be
          </a>
          .
        </p>

        <label htmlFor="rgpd" className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            id="rgpd"
            name="rgpd"
            required
            className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 text-gold focus:ring-gold/30"
          />
          <span>
            J&apos;accepte que les informations renseignées ci-dessus soient
            utilisées par Agrisem S.A. dans le cadre du traitement de ma
            demande, conformément à la politique de confidentialité décrite
            ci-dessus. <span className="text-gold">*</span>
          </span>
        </label>
      </div>

      {status === "error" && (
        <p className="text-sm font-medium text-red-600">
          Une erreur est survenue lors de l&apos;envoi de votre message.
          Merci de réessayer ou de nous contacter directement par téléphone.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex w-full items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-navy-dark transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
      </button>
    </form>
  );
}

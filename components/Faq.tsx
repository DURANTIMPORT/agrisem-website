import Reveal from "@/components/Reveal";

const faqItems = [
  {
    question: "Quels types de matériel propose Agrisem S.A. ?",
    answer:
      "Agrisem S.A. propose une large gamme de matériel agricole, de manutention et de chantier : tracteurs et machines agricoles Massey Ferguson, chargeurs télescopiques Merlo, matériel de fenaison et de fertilisation Kuhn, mini-pelles et chargeuses compactes Takeuchi, ainsi que des chargeurs articulés et télescopiques Giant.",
  },
  {
    question: "Où se situe Agrisem S.A. et quelle est votre zone d'intervention ?",
    answer:
      "Notre concession est basée Rue de Villers 21 à 5630 Daussois, en Belgique. Depuis 1992, nous accompagnons les professionnels de l'agriculture et du BTP dans toute la région et au-delà.",
  },
  {
    question: "Proposez-vous un service après-vente et des pièces détachées ?",
    answer:
      "Oui. Notre atelier et notre équipe technique assurent l'entretien, les réparations et la fourniture de pièces détachées d'origine pour l'ensemble des marques que nous représentons.",
  },
  {
    question: "Proposez-vous également un service de pneus ?",
    answer:
      "Oui, Agrisem S.A. propose la vente et le montage de tous types de pneus : pneus agricoles, pneus de chantier et pneus pour voitures, toutes marques confondues.",
  },
  {
    question: "Vendez-vous également du matériel d'occasion ?",
    answer:
      "Oui, retrouvez notre sélection de matériel d'occasion sur agrimarket.be, accessible directement depuis l'onglet « Nos occasions » de notre site.",
  },
  {
    question: "Comment obtenir un devis ou contacter Agrisem S.A. ?",
    answer:
      "Vous pouvez nous contacter via le formulaire de notre page Contact, par téléphone au +32 (0)71 61 45 92 ou par e-mail à info@agrisem.be. Notre équipe vous répond dans les plus brefs délais.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Faq() {
  return (
    <section id="faq" className="bg-white px-6 py-24 text-navy-dark">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
            Questions fréquentes
          </h2>
        </Reveal>
        <div className="mt-12 space-y-8">
          {faqItems.map((item) => (
            <Reveal key={item.question}>
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-2 text-navy-dark/70">{item.answer}</p>
            </Reveal>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}

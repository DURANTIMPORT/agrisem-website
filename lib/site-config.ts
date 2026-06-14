export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.agrisem.be";

export const SITE_NAME = "Agrisem S.A.";

export const SITE_DESCRIPTION =
  "Agrisem S.A., concessionnaire à Daussois (Belgique) pour Massey Ferguson, Merlo, Kuhn, Takeuchi et Giant : matériel agricole, de manutention et de chantier, pièces détachées et service après-vente.";

export const BUSINESS = {
  name: SITE_NAME,
  telephone: "+32 71 61 45 92",
  email: "info@agrisem.be",
  streetAddress: "Rue de Villers 21",
  postalCode: "5630",
  addressLocality: "Daussois",
  addressCountry: "BE",
} as const;

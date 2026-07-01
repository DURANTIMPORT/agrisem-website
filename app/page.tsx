import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import BrandSection from "@/components/BrandSection";
import Faq from "@/components/Faq";

const brands = [
  {
    name: "Massey Ferguson",
    tagline: "Tracteurs & matériel agricole",
    description:
      "Une gamme complète de tracteurs et de machines agricoles reconnus pour leur fiabilité et leur performance.",
    href: "https://www.masseyferguson.com/fr_fr.html",
    image: "/brands/massey-ferguson.png",
    imageAlt: "Tracteur Massey Ferguson série 9S",
    bg: "bg-[#0c0c0e]",
    fg: "text-white",
    accent: "#e2231a",
    fit: "contain" as const,
    logo: {
      src: "/brands/massey-ferguson-logo.png",
      width: 1525,
      height: 704,
    },
    video: {
      mp4: "/brands/mf9s-hero.mp4",
      webm: "/brands/mf9s-hero.webm",
      poster: "/brands/massey-ferguson-poster.jpg",
    },
  },
  {
    name: "Merlo",
    tagline: "Chargeurs télescopiques",
    description:
      "Le leader mondial des chargeurs télescopiques pour l'agriculture, la construction et l'industrie.",
    href: "https://www.merlo.com/bel/fr/",
    image: "/brands/merlo.jpg",
    imageAlt: "Chargeur télescopique Merlo Roto",
    bg: "bg-[#0e1a0c]",
    fg: "text-white",
    accent: "#9ed83b",
    reverse: true,
    logo: {
      src: "/brands/merlo-logo.png",
      width: 1838,
      height: 250,
      className: "h-8 w-auto max-w-full sm:h-10 lg:h-12",
    },
    video: {
      mp4: "/brands/merlo-hero.mp4",
      webm: "/brands/merlo-hero.webm",
      poster: "/brands/merlo-poster.jpg",
    },
  },
  {
    name: "Kuhn",
    tagline: "Matériel de fertilisation et de fenaison",
    description:
      "Des solutions innovantes pour le travail du sol, le semis, la fertilisation et la récolte des fourrages.",
    href: "https://www.kuhn.fr",
    image: "/brands/kuhn.jpg",
    imageAlt: "Épandeur Kuhn Axent en action dans un champ",
    bg: "bg-[#fdf3e7]",
    fg: "text-navy-dark",
    accent: "#e9531e",
    logo: {
      src: "/brands/kuhn-logo.png",
      width: 552,
      height: 291,
    },
    video: {
      mp4: "/brands/kuhn-hero.mp4",
      webm: "/brands/kuhn-hero.webm",
      poster: "/brands/kuhn-poster.jpg",
    },
  },
  {
    name: "Takeuchi",
    tagline: "Engins de chantier",
    description:
      "Mini-pelles et chargeuses compactes conçues pour la performance et la durabilité sur tous les chantiers.",
    href: "https://www.takeuchibenelux.com/fr/",
    image: "/brands/takeuchi.jpg",
    imageAlt: "Pelleteuse Takeuchi TB395W",
    bg: "bg-[#1a1a1a]",
    fg: "text-white",
    accent: "#e7161e",
    reverse: true,
    logo: {
      src: "/brands/takeuchi-logo.png",
      width: 600,
      height: 72,
      className: "h-8 w-auto max-w-full sm:h-10 lg:h-12",
    },
    video: {
      mp4: "/brands/takeuchi-hero.mp4",
      webm: "/brands/takeuchi-hero.webm",
      poster: "/brands/takeuchi-poster.jpg",
    },
  },
  {
    name: "Giant",
    tagline: "Chargeurs compacts",
    description:
      "Des chargeurs articulés et télescopiques compacts, polyvalents pour l'agriculture et les espaces verts.",
    href: "https://configurator.tobroco-giant.com/fr/produits/g1200-tele",
    image: "/brands/giant.jpg",
    imageAlt: "Chargeur télescopique Giant G1200",
    bg: "bg-[#1f7a3f]",
    fg: "text-white",
    accent: "#f3a93b",
    reverse: true,
    logo: {
      src: "/brands/giant-logo.png",
      width: 1800,
      height: 621,
      className: "h-16 w-auto max-w-full sm:h-20 lg:h-24",
    },
    video: {
      mp4: "/brands/giant-hero.mp4",
      webm: "/brands/giant-hero.webm",
      poster: "/brands/giant-poster.jpg",
    },
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0c0c0e] px-6 text-center text-white">
        <Parallax speed={0.1} className="absolute inset-0 scale-110">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/brands/massey-ferguson-poster.jpg"
          >
            <source src="/brands/mf9s-hero.webm" type="video/webm" />
            <source src="/brands/mf9s-hero.mp4" type="video/mp4" />
          </video>
        </Parallax>
        <div className="absolute inset-0 bg-black/55" />
        <Reveal className="relative z-10 flex flex-col items-center">
          <Image
            src="/logo-white.png"
            alt="Agrisem S.A."
            width={1000}
            height={334}
            priority
            className="mb-8 h-32 w-auto max-w-full sm:h-48"
          />
          <Parallax speed={0.4}>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Au service de l&apos;agriculture
              <br className="hidden sm:block" /> et des entrepreneurs
              <br className="hidden sm:block" /> depuis 1992.
            </h1>
          </Parallax>
          <a
            href="#marques"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-white transition-transform duration-300 hover:scale-105"
          >
            Découvrir nos marques
          </a>
        </Reveal>
      </section>

      {/* Brands */}
      <div id="marques">
        {brands.map((brand) => (
          <BrandSection key={brand.name} {...brand} />
        ))}
      </div>

      {/* FAQ */}
      <Faq />

      {/* About / strip */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Une expertise au service de votre exploitation
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              Basés à Daussois, nous accompagnons les professionnels de
              l&apos;agriculture et du BTP avec des partenaires de confiance.
              Contactez-nous pour toute question sur nos produits.
            </p>
            <Link
              href="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white hover:text-navy-dark"
            >
              Nous contacter
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

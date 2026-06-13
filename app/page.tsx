import Image from "next/image";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import BrandSection from "@/components/BrandSection";

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
    video: {
      mp4: "/brands/merlo-hero.mp4",
      webm: "/brands/merlo-hero.webm",
      poster: "/brands/merlo-poster.jpg",
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
          <div className="mb-8 inline-flex items-center rounded-2xl bg-white/95 px-6 py-3 shadow-lg backdrop-blur">
            <Image
              src="/logo.jpg"
              alt="Agrisem S.A."
              width={220}
              height={46}
              priority
              className="h-9 w-auto sm:h-12"
            />
          </div>
          <Parallax speed={0.4}>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Au service de l&apos;agriculture
              <br className="hidden sm:block" /> et des entrepreneurs
              <br className="hidden sm:block" /> depuis 1992.
            </h1>
          </Parallax>
          <a
            href="#marques"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-navy-dark transition-transform duration-300 hover:scale-105"
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

      {/* About / strip */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Une expertise au service de votre exploitation
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              Basés à Cerfontaine, nous accompagnons les professionnels de
              l&apos;agriculture et du BTP avec des partenaires de confiance.
              Contactez-nous pour toute question sur nos produits.
            </p>
            <a
              href="#contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-base font-medium text-navy-dark transition-colors hover:bg-white"
            >
              Nous contacter
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

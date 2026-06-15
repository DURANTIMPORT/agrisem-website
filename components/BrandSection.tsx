import Image from "next/image";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";

type BrandSectionProps = {
  name: string;
  tagline: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  bg: string;
  fg: string;
  accent: string;
  reverse?: boolean;
  fit?: "cover" | "contain";
  video?: { mp4: string; webm: string; poster: string };
  kenBurns?: boolean;
  logo?: { src: string; width: number; height: number; className?: string };
};

export default function BrandSection({
  name,
  tagline,
  description,
  href,
  image,
  imageAlt,
  bg,
  fg,
  accent,
  reverse = false,
  fit = "cover",
  video,
  kenBurns = false,
  logo,
}: BrandSectionProps) {
  return (
    <section
      className={`relative flex min-h-screen w-full flex-col overflow-hidden ${bg} ${fg} lg:flex-row ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="relative flex h-[45vh] w-full items-center justify-center overflow-hidden lg:h-screen lg:w-1/2">
        {video ? (
          <Parallax speed={0.1} className="absolute inset-0 scale-110">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={video.poster}
            >
              <source src={video.webm} type="video/webm" />
              <source src={video.mp4} type="video/mp4" />
            </video>
          </Parallax>
        ) : (
          <Parallax speed={0.18} className="absolute inset-0">
            {fit === "cover" ? (
              <Image
                src={image}
                alt={imageAlt}
                fill
                className={`object-cover ${kenBurns ? "ken-burns" : "scale-110"}`}
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="scale-110 object-contain p-8 lg:p-16"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            )}
          </Parallax>
        )}
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-8 py-16 lg:w-1/2 lg:px-20">
        <Reveal>
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {tagline}
          </span>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {logo ? (
              <Image
                src={logo.src}
                alt={name}
                width={logo.width}
                height={logo.height}
                className={
                  logo.className ?? "h-14 w-auto max-w-full sm:h-20 lg:h-24"
                }
              />
            ) : (
              name
            )}
          </h2>
          <p className="mt-6 max-w-md text-lg opacity-80">{description}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-medium transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: accent, color: "#0a1830" }}
          >
            Plus d&apos;informations
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

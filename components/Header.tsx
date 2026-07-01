import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Agrisem S.A."
            width={1000}
            height={334}
            priority
            className="h-12 w-auto sm:h-16"
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-navy-dark">
          <Link href="/" className="transition-colors hover:text-gold">
            Accueil
          </Link>
          <Link href="/a-propos" className="transition-colors hover:text-gold">
            À propos
          </Link>
          <Link href="/#marques" className="transition-colors hover:text-gold">
            Nos marques
          </Link>
          <a
            href="https://agrimarket.be"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gold"
          >
            Nos occasions
          </a>
          <Link href="/evenements" className="transition-colors hover:text-gold">
            Événements
          </Link>
          <Link href="/contact" className="transition-colors hover:text-gold">
            Contact
          </Link>
          <Link
            href="/pro"
            className="ml-1 rounded-full border border-navy-dark/20 px-3 py-1 text-xs text-navy-dark/60 transition-colors hover:border-gold hover:text-gold"
          >
            Espace Pro
          </Link>
        </nav>
      </div>
    </header>
  );
}

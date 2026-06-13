export default function Footer() {
  return (
    <footer id="contact" className="bg-navy-dark text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-2xl font-semibold">Agrisem S.A.</h3>
            <p className="mt-4 max-w-sm text-sm text-white/70">
              Votre concessionnaire pour le matériel agricole, de manutention
              et de chantier. Découvrez nos marques partenaires et leurs
              gammes complètes.
            </p>
          </div>
          <div className="text-sm text-white/80">
            <h4 className="mb-3 text-base font-semibold text-white">
              Contact
            </h4>
            <p>Rue de Villers 21</p>
            <p>5630 Cerfontaine, Belgique</p>
            <p className="mt-3">
              <a
                href="tel:+3271614592"
                className="transition-colors hover:text-gold"
              >
                +32 (0)71 61 45 92
              </a>
            </p>
            <p>
              <a
                href="mailto:info@agrisem.be"
                className="transition-colors hover:text-gold"
              >
                info@agrisem.be
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Agrisem S.A. — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

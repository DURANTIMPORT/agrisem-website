import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { roleFromUser } from "@/lib/pro/roles";

type Tuile = {
  titre: string;
  description: string;
  bientot: boolean;
  href?: string;
};

const TUILES_COMMERCIAL: Tuile[] = [
  {
    titre: "Calculateur de remises",
    description: "Prix net concessionnaire par modèle Massey Ferguson.",
    bientot: false,
    href: "/pro/calculateur",
  },
];

const TUILES_ADMIN: Tuile[] = [
  {
    titre: "Import des grilles (PDF)",
    description: "Mettre à jour remises et stock depuis les PDF MF.",
    bientot: false,
    href: "/pro/import",
  },
  {
    titre: "Équipe",
    description: "Inviter ou retirer un commercial.",
    bientot: false,
    href: "/pro/equipe",
  },
  {
    titre: "Paramètres",
    description: "Affichage de la marge, réglages de l'espace.",
    bientot: true,
  },
];

export default async function ProHomePage() {
  const user = await currentUser();
  const role = roleFromUser(user);
  const prenom = user?.firstName ?? "";

  const tuiles =
    role === "admin"
      ? [...TUILES_COMMERCIAL, ...TUILES_ADMIN]
      : TUILES_COMMERCIAL;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-sm text-navy-dark/60">
          Bonjour{prenom ? ` ${prenom}` : ""},
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-navy-dark">
          Espace Pro Agrisem
        </h1>
        <span className="mt-2 inline-block rounded-full bg-[#C71121] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          {role === "admin" ? "Administrateur" : "Commercial"}
        </span>
      </div>

      <div className="space-y-3">
        {tuiles.map((tuile) => {
          const contenu = (
            <>
              <div>
                <h2 className="text-base font-semibold text-navy-dark">
                  {tuile.titre}
                </h2>
                <p className="mt-0.5 text-sm text-navy-dark/60">
                  {tuile.description}
                </p>
              </div>
              {tuile.bientot ? (
                <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-navy-dark/50">
                  Bientôt
                </span>
              ) : tuile.href ? (
                <span className="shrink-0 text-navy-dark/30">›</span>
              ) : null}
            </>
          );

          const classes =
            "flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm";

          return tuile.href ? (
            <Link
              key={tuile.titre}
              href={tuile.href}
              className={`${classes} transition-colors hover:border-[#C71121]`}
            >
              {contenu}
            </Link>
          ) : (
            <div key={tuile.titre} className={classes}>
              {contenu}
            </div>
          );
        })}
      </div>

      {role === "commercial" && (
        <p className="text-center text-xs text-navy-dark/40">
          Accès en consultation. Contactez un administrateur pour toute
          modification.
        </p>
      )}
    </div>
  );
}

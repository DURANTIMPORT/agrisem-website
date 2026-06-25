import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { roleFromUser } from "@/lib/pro/roles";
import { margeVisibleCommercial } from "@/lib/pro/settings";
import { enregistrerParametres } from "./actions";

export const metadata = { title: "Paramètres" };

export default async function ParametresPage() {
  const me = await currentUser();
  // Garde d'accès CÔTÉ SERVEUR : admin uniquement.
  if (roleFromUser(me) !== "admin") redirect("/pro");

  const margeVisible = await margeVisibleCommercial();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#1c1d1f]">Paramètres</h1>
        <p className="mt-1 text-sm text-[#848689]">Réglages de l&apos;espace Pro.</p>
      </div>

      <form action={enregistrerParametres} className="rounded-xl border border-black/10 bg-white p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="marge"
            defaultChecked={margeVisible}
            className="mt-1 h-4 w-4 shrink-0 rounded border-black/20 text-[#C71121] focus:ring-[#C71121]/30"
          />
          <span>
            <span className="block font-medium text-[#1c1d1f]">
              Afficher la marge aux commerciaux
            </span>
            <span className="mt-0.5 block text-sm text-[#848689]">
              Désactivé par défaut : les commerciaux voient le prix net
              concessionnaire et le prix retail, mais pas la marge (l&apos;écart
              entre les deux). Les administrateurs voient toujours la marge.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="mt-4 rounded-lg bg-[#C71121] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Enregistrer
        </button>
      </form>

      <p className="text-xs text-[#848689]">
        État actuel : la marge est{" "}
        <strong className="text-[#1c1d1f]">
          {margeVisible ? "visible" : "masquée"}
        </strong>{" "}
        pour les commerciaux.
      </p>
    </div>
  );
}
